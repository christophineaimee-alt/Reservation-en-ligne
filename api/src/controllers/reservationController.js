const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const { notifier } = require('../services/notificationService');
const S = require('../services/reservationService');
const { actualiserStatut } = require('../services/paiementService');

const STATUTS = ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'ANNULEE', 'EXPIREE'];
const { promotionsActives, meilleurePromotion } = require('../services/promotionService');

async function clientConnecte(idUser) {
  const client = await prisma.client.findUnique({ where: { idUser } });
  if (!client) throw new AppError('Profil client introuvable', 403);
  return client;
}

// UC07 : effectuer une réservation
const creer = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const { idProduitService, remarque, idDisponibilite, dateRetrait } = req.body;
  const quantiteDemandee = req.body.quantite ?? 1;

  if (!Number.isInteger(idProduitService)) throw new AppError('idProduitService obligatoire', 400);
  if (!Number.isInteger(quantiteDemandee) || quantiteDemandee < 1) throw new AppError('Quantité invalide', 400);

  const article = await prisma.produitService.findFirst({
    where: { idProduitService, actif: true, boutique: { statut: 'VALIDEE' } },
    include: { boutique: { include: { commercant: true } } },
  });
  if (!article) throw new AppError('Élément introuvable', 404);

  let dateHeure;
  let creneau = null;
  if (article.type === 'SERVICE') {
    if (!Number.isInteger(idDisponibilite)) throw new AppError('Choisissez un créneau (idDisponibilite)', 400);
    creneau = await prisma.disponibilite.findFirst({
      where: { idDisponibilite, idBoutique: article.idBoutique },
    });
    if (!creneau || creneau.bloque) {
      throw new AppError('Créneau indisponible. Consultez les autres disponibilités.', 409);
    }
    dateHeure = S.dateHeureCreneau(creneau);
    if (dateHeure <= new Date()) throw new AppError('Ce créneau est déjà passé', 400);
  } else {
    if (!dateRetrait) throw new AppError('Indiquez la date de retrait (dateRetrait)', 400);
    dateHeure = new Date(dateRetrait);
    if (Number.isNaN(dateHeure.getTime()) || dateHeure <= new Date()) {
      throw new AppError('La date de retrait doit être dans le futur', 400);
    }
  }
  const quantite = article.type === 'SERVICE' ? 1 : quantiteDemandee;
    // Promotion en cours : la remise est figée sur la réservation
  const montantInitial = Math.round(Number(article.prix) * quantite);
  const meilleure = meilleurePromotion(
    await promotionsActives(article.idBoutique),
    article.idProduitService,
    montantInitial
  );
  const remise = meilleure ? meilleure.remise : 0;

  // Message 4 et 5 de la séquence : vérifier la disponibilité, puis créer
  const reservation = await prisma.$transaction(async (tx) => {
    if (article.type === 'PRODUIT') {
      const ok = await S.bloquerStock(tx, article.idProduitService, quantite);
      if (!ok) {
        const stock = await tx.stock.findUnique({ where: { idProduitService: article.idProduitService } });
        throw new AppError('Produit indisponible : stock insuffisant', 409, {
          quantiteDisponible: stock ? stock.quantite : 0,
        });
      }
    } else {
      await S.verrouillerCreneau(tx, creneau.idDisponibilite);
      const restantes = await S.placesRestantes(tx, creneau);
      if (restantes <= 0) {
        throw new AppError('Ce créneau est complet. Consultez les autres disponibilités.', 409);
      }
    }
    return tx.reservation.create({
      data: {
        quantite,
        remarque,
        dateHeure,
        statut: 'EN_ATTENTE',
        dateExpiration: S.calculerExpiration(dateHeure),
        idClient: client.idClient,
        idProduitService: article.idProduitService,
        idDisponibilite: creneau ? creneau.idDisponibilite : null,
        montantInitial,
        remise,
        montantTotal: montantInitial - remise,
        idPromotion: meilleure ? meilleure.promotion.idPromotion : null,
      },
      include: S.inclureClient,
    });
  });

  // Message 9 : notifier le commerçant
  const idUserCommercant = article.boutique.commercant.idUser;
  await notifier(
    idUserCommercant,
    'NOUVELLE_DEMANDE',
    'Nouvelle demande de réservation',
    `${req.utilisateur.prenom} ${req.utilisateur.nom} a demandé « ${article.nom} ».`
  );
  if (article.type === 'PRODUIT') await S.alerterStockSiFaible(article.idProduitService, idUserCommercant);

  res.status(201).json({
    message: 'Réservation enregistrée, en attente de la réponse du commerçant',
    reservation: S.formater(reservation),
  });
});

// UC08 : annuler une réservation
const annuler = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const id = parseId(req.params.id);

  const reservation = await prisma.reservation.findFirst({
    where: { idReservation: id, idClient: client.idClient },
    include: {
      produitService: { include: { boutique: { include: { commercant: true } } } },
      paiements: true,
    },
  });
  if (!reservation) throw new AppError('Réservation introuvable', 404);

  // Message 9 et 10 : statut et délai (RG1 et RG3)
  if (!S.ACTIVES.includes(reservation.statut)) {
    throw new AppError(`Cette réservation ne peut plus être annulée (statut : ${reservation.statut})`, 409);
  }
  const limite = new Date(reservation.dateHeure.getTime() - S.DELAI_ANNULATION_HEURES * S.HEURE_MS);
  if (new Date() > limite) {
    throw new AppError(
      `Délai d'annulation dépassé (${S.DELAI_ANNULATION_HEURES} h avant le rendez-vous). Contactez la boutique.`,
      409
    );
  }
  
  // Pas d'annulation d'une réservation payée ou en cours de paiement (pas de remboursement en ligne)
  for (const p of reservation.paiements.filter((x) => x.statut === 'EN_ATTENTE')) {
    await actualiserStatut(p);
  }
  const paiements = await prisma.paiement.findMany({ where: { idReservation: id } });
  if (paiements.some((p) => p.statut === 'REUSSI')) {
    throw new AppError(
      "Cette réservation est déjà payée : elle ne peut pas être annulée en ligne. Contactez la boutique.",
      409
    );
  }
  if (paiements.some((p) => p.statut === 'EN_ATTENTE')) {
    throw new AppError('Un paiement est en cours : confirmez-le ou attendez son expiration avant d\'annuler.', 409);
  }

  await prisma.$transaction(async (tx) => {
    const maj = await tx.reservation.updateMany({
      where: { idReservation: id, statut: { in: S.ACTIVES } },
      data: { statut: 'ANNULEE' },
    });
    if (maj.count === 0) throw new AppError('Cette réservation a déjà été traitée', 409);
    if (reservation.produitService.type === 'PRODUIT') {
      await S.libererStock(tx, reservation.idProduitService, reservation.quantite);
    }
  });

  await notifier(
    reservation.produitService.boutique.commercant.idUser,
    'RESERVATION_ANNULEE',
    'Réservation annulée',
    `${req.utilisateur.prenom} ${req.utilisateur.nom} a annulé sa réservation de « ${reservation.produitService.nom} ».`
  );

  res.json({ message: 'Réservation annulée', idReservation: id, statut: 'ANNULEE' });
});

// UC09 : historique des réservations
const lister = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 50);

  const where = { idClient: client.idClient };
  if (req.query.statut) {
    if (!STATUTS.includes(req.query.statut)) throw new AppError('Statut invalide', 400);
    where.statut = req.query.statut;
  }

  const [total, liste] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      include: S.inclureClient,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
  ]);

  res.json({
    total,
    page,
    limite,
    message: total === 0 ? 'Aucune réservation. Réservez dans une boutique !' : undefined,
    reservations: liste.map(S.formater),
  });
});

// UC09 : détail d'une réservation
const detail = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const reservation = await prisma.reservation.findFirst({
    where: { idReservation: id, idClient: client.idClient },
    include: S.inclureClient,
  });
  if (!reservation) throw new AppError('Réservation introuvable', 404);
  res.json({ reservation: S.formater(reservation) });
});

module.exports = { creer, annuler, lister, detail };