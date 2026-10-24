const crypto = require('crypto');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const { choisir } = require('../services/paiement');
const { montantReservation, formaterPaiement, actualiserStatut } = require('../services/paiementService');
const { controler, LIBELLES } = require('../utils/telephone');
const env = require('../config/env');

async function clientConnecte(idUser) {
  const client = await prisma.client.findUnique({ where: { idUser } });
  if (!client) throw new AppError('Profil client introuvable', 403);
  return client;
}

// Payer une réservation acceptée
const payer = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const { operateur, telephone } = req.body;

  const reservation = await prisma.reservation.findFirst({
    where: { idReservation: id, idClient: client.idClient },
    include: { produitService: { select: { nom: true, prix: true } }, paiements: true },
  });
  if (!reservation) throw new AppError('Réservation introuvable', 404);

  if (reservation.statut === 'EN_ATTENTE') {
    throw new AppError("Le commerçant n'a pas encore accepté cette réservation. Vous pourrez payer après son acceptation.", 409);
  }
  if (reservation.statut !== 'ACCEPTEE') {
    throw new AppError(`Cette réservation ne peut pas être payée (statut : ${reservation.statut})`, 409);
  }
  if (reservation.dateHeure < new Date()) {
    throw new AppError('Le rendez-vous est passé : le paiement en ligne est fermé', 409);
  }

  // On met d'abord à jour les paiements encore en attente avant de décider
  for (const p of reservation.paiements.filter((x) => x.statut === 'EN_ATTENTE')) {
    await actualiserStatut(p);
  }
  const paiements = await prisma.paiement.findMany({ where: { idReservation: id } });
  if (paiements.some((p) => p.statut === 'REUSSI')) throw new AppError('Cette réservation est déjà payée', 409);
  const enCours = paiements.find((p) => p.statut === 'EN_ATTENTE');
  if (enCours) {
    throw new AppError('Un paiement est déjà en cours : confirmez-le sur votre téléphone', 409, {
      idPaiement: enCours.idPaiement,
    });
  }

  const controle = controler(operateur, telephone);
  if (!controle.ok) throw new AppError(controle.message, 400);

  const montant = montantReservation(reservation);
  if (!(montant > 0)) throw new AppError('Montant nul : rien à payer en ligne', 400);

  // On enregistre le paiement avant d'appeler l'opérateur, pour ne jamais perdre sa trace
  const referenceInterne = `PAY-${id}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const paiement = await prisma.paiement.create({
    data: { idReservation: id, montant, operateur, telephonePayeur: controle.numero, referenceInterne },
  });

  let initiation;
  try {
    initiation = await choisir(operateur).initier({
      montant,
      devise: 'MGA',
      telephone: controle.numero,
      referenceInterne,
      description: `Réservation ${id} : ${reservation.produitService.nom}`,
    });
  } catch (e) {
    await prisma.paiement.update({
      where: { idPaiement: paiement.idPaiement },
      data: { statut: 'ECHOUE', messageErreur: "Opérateur injoignable" },
    });
    throw new AppError("Impossible de joindre l'opérateur. Réessayez dans un instant.", 502);
  }

  const maj = await prisma.paiement.update({
    where: { idPaiement: paiement.idPaiement },
    data: { referenceOperateur: initiation.referenceOperateur },
  });

  res.status(202).json({
    message: `Demande envoyée à ${LIBELLES[operateur]}. Confirmez le paiement sur votre téléphone.`,
    paiement: formaterPaiement(maj),
  });
});

// Suivre un paiement (le téléphone interroge cette route jusqu'à l'état final)
const statut = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const id = parseId(req.params.id);

  const paiement = await prisma.paiement.findFirst({
    where: { idPaiement: id, reservation: { idClient: client.idClient } },
  });
  if (!paiement) throw new AppError('Paiement introuvable', 404);

  const actuel = await actualiserStatut(paiement);
  res.json({
    paiement: formaterPaiement(actuel),
    termine: actuel.statut !== 'EN_ATTENTE',
  });
});

const STATUTS_PAIEMENT = ['EN_ATTENTE', 'REUSSI', 'ECHOUE', 'EXPIRE'];

// Historique des paiements du client, avec un petit résumé
const lister = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 50);
  const base = { reservation: { idClient: client.idClient } };
  const where = { ...base };
  if (req.query.statut) {
    if (!STATUTS_PAIEMENT.includes(req.query.statut)) throw new AppError('Statut invalide', 400);
    where.statut = req.query.statut;
  }

  const liste = await prisma.paiement.findMany({
    where,
    include: {
      reservation: {
        select: {
          dateHeure: true,
          produitService: { select: { nom: true, boutique: { select: { nom: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limite,
    take: limite,
  });

  // Les paiements encore « en attente » sont mis à jour auprès de l'opérateur (ici le simulateur)
  const paiements = [];
  for (const p of liste) {
    let courant = p;
    if (p.statut === 'EN_ATTENTE') {
      const maj = await actualiserStatut(p);
      courant = { ...p, statut: maj.statut, messageErreur: maj.messageErreur, datePaiement: maj.datePaiement };
    }
    paiements.push({
      ...formaterPaiement(courant),
      reservation: {
        nomElement: p.reservation.produitService.nom,
        boutique: p.reservation.produitService.boutique.nom,
        dateHeure: p.reservation.dateHeure,
      },
    });
  }

  const [total, somme, nombreEnCours] = await Promise.all([
    prisma.paiement.count({ where }),
    prisma.paiement.aggregate({ where: { ...base, statut: 'REUSSI' }, _sum: { montant: true }, _count: true }),
    prisma.paiement.count({ where: { ...base, statut: 'EN_ATTENTE' } }),
  ]);

  res.json({
    mode: env.paiementMode,
    total,
    page,
    limite,
    totalPaye: Number(somme._sum.montant || 0),
    nombrePayes: somme._count,
    nombreEnCours,
    paiements,
  });
});

// Reçu d'un paiement réussi
const recu = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const paiement = await prisma.paiement.findFirst({
    where: { idPaiement: id, reservation: { idClient: client.idClient } },
    include: {
      reservation: {
        include: {
          produitService: {
            include: { boutique: { select: { nom: true, adresse: true, ville: true, telephone: true } } },
          },
        },
      },
    },
  });
  if (!paiement) throw new AppError('Paiement introuvable', 404);
  if (paiement.statut !== 'REUSSI') {
    throw new AppError("Aucun reçu : ce paiement n'est pas confirmé", 409);
  }
  const f = formaterPaiement(paiement);
  const reservation = paiement.reservation;
  const element = reservation.produitService;
  const dateRecu = paiement.datePaiement || paiement.createdAt;
  res.json({
    recu: {
      numero: `REC-${new Date(dateRecu).getFullYear()}-${String(paiement.idPaiement).padStart(6, '0')}`,
      datePaiement: dateRecu,
      mode: env.paiementMode,
      simulation: env.paiementMode === 'simulation',
      montant: f.montant,
      devise: f.devise,
      operateur: f.operateur,
      operateurLibelle: f.operateurLibelle,
      telephone: f.telephone,
      referenceInterne: paiement.referenceInterne,
      referenceOperateur: paiement.referenceOperateur,
      idReservation: reservation.idReservation,
      rendezVous: reservation.dateHeure,
      boutique: element.boutique,
      client: `${req.utilisateur.prenom} ${req.utilisateur.nom}`,
      element: {
        nom: element.nom,
        type: element.type,
        quantite: reservation.quantite,
        prixUnitaire: Number(element.prix),
      },
    },
  });
});

module.exports = { payer, statut, lister, recu };