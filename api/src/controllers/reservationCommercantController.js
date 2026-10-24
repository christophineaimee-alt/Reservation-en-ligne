const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { notifier } = require('../services/notificationService');
const S = require('../services/reservationService');

const STATUTS = ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'ANNULEE', 'EXPIREE'];

async function reservationDeLaBoutique(req) {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const reservation = await prisma.reservation.findFirst({
    where: { idReservation: id, produitService: { idBoutique: boutique.idBoutique } },
    include: S.inclureCommercant,
  });
  if (!reservation) throw new AppError('Demande introuvable', 404);
  return reservation;
}

// Cas « demande annulée entre-temps » (11 et 12 de UC17, 11 de UC18)
function verifierTraitable(r) {
  if (r.statut === 'ANNULEE') throw new AppError('Demande annulée entre-temps : action refusée', 409);
  if (r.statut === 'EXPIREE') throw new AppError('Demande expirée', 409);
  if (r.statut !== 'EN_ATTENTE') throw new AppError(`Demande déjà traitée (statut : ${r.statut})`, 409);
  if (r.dateExpiration && r.dateExpiration < new Date()) throw new AppError('Demande expirée', 409);
}

// UC16 : liste des réservations de la boutique (demandes en attente en premier)
const lister = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 50);

  const where = { produitService: { idBoutique: boutique.idBoutique } };
  if (req.query.statut) {
    if (!STATUTS.includes(req.query.statut)) throw new AppError('Statut invalide', 400);
    where.statut = req.query.statut;
  }

  const [total, liste] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      include: S.inclureCommercant,
      orderBy: [{ statut: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limite,
      take: limite,
    }),
  ]);

  res.json({
    total,
    page,
    limite,
    message: total === 0 ? 'Aucune demande de réservation' : undefined,
    reservations: liste.map(S.formater),
  });
});

// UC16 : détail d'une demande
const detail = asyncHandler(async (req, res) => {
  const reservation = await reservationDeLaBoutique(req);
  res.json({ reservation: S.formater(reservation) });
});

// UC17 : accepter une réservation
const accepter = asyncHandler(async (req, res) => {
  const r = await reservationDeLaBoutique(req);
  verifierTraitable(r);

  // Message 9 et 10 : acceptation impossible si l'élément ou le créneau n'est plus disponible
  if (!r.produitService.actif) {
    throw new AppError('Acceptation impossible : cet élément est désactivé. Vous pouvez refuser la demande.', 409);
  }
  if (r.disponibilite && r.disponibilite.bloque) {
    throw new AppError('Acceptation impossible : le créneau est bloqué. Vous pouvez refuser la demande.', 409);
  }

  const maj = await prisma.reservation.updateMany({
    where: { idReservation: r.idReservation, statut: 'EN_ATTENTE' },
    data: { statut: 'ACCEPTEE', dateExpiration: null },
  });
  if (maj.count === 0) throw new AppError('Demande annulée entre-temps : action refusée', 409);

  await notifier(
    r.client.utilisateur.idUser,
    'RESERVATION_ACCEPTEE',
    'Réservation acceptée',
    `Votre réservation de « ${r.produitService.nom} » chez ${r.produitService.boutique.nom} est acceptée.`
  );

  const reservation = await prisma.reservation.findUnique({
    where: { idReservation: r.idReservation },
    include: S.inclureCommercant,
  });
  res.json({ message: 'Réservation acceptée', reservation: S.formater(reservation) });
});

// UC18 : refuser une réservation (motif obligatoire)
const refuser = asyncHandler(async (req, res) => {
  const r = await reservationDeLaBoutique(req);
  verifierTraitable(r);
  const motif = String(req.body.motif || '').trim();
  if (!motif) throw new AppError('Le motif de refus est obligatoire', 400);

  await prisma.$transaction(async (tx) => {
    const maj = await tx.reservation.updateMany({
      where: { idReservation: r.idReservation, statut: 'EN_ATTENTE' },
      data: { statut: 'REFUSEE', motifRefus: motif },
    });
    if (maj.count === 0) throw new AppError('Demande annulée entre-temps : action refusée', 409);
    if (r.produitService.type === 'PRODUIT') {
      await S.libererStock(tx, r.produitService.idProduitService, r.quantite);
    }
  });

  await notifier(
    r.client.utilisateur.idUser,
    'RESERVATION_REFUSEE',
    'Réservation refusée',
    `Votre réservation de « ${r.produitService.nom} » chez ${r.produitService.boutique.nom} est refusée. Motif : ${motif}`
  );

  res.json({ message: 'Réservation refusée', idReservation: r.idReservation, statut: 'REFUSEE', motifRefus: motif });
});

// Annulation par le commerçant d'une réservation déjà acceptée (motif obligatoire)
const annuler = asyncHandler(async (req, res) => {
  const r = await reservationDeLaBoutique(req);
  if (r.statut !== 'ACCEPTEE') {
    throw new AppError(`Seule une réservation acceptée peut être annulée ici (statut : ${r.statut})`, 409);
  }
  const motif = String(req.body.motif || '').trim();
  if (!motif) throw new AppError("Le motif d'annulation est obligatoire", 400);
  await prisma.$transaction(async (tx) => {
    const maj = await tx.reservation.updateMany({
      where: { idReservation: r.idReservation, statut: 'ACCEPTEE' },
      data: { statut: 'ANNULEE', motifRefus: motif },
    });
    if (maj.count === 0) throw new AppError('Réservation modifiée entre-temps : action refusée', 409);
    if (r.produitService.type === 'PRODUIT') {
      await S.libererStock(tx, r.produitService.idProduitService, r.quantite);
    }
  });
  await notifier(
    r.client.utilisateur.idUser,
    'RESERVATION_ANNULEE_COMMERCANT',
    'Réservation annulée par le commerçant',
    `Votre réservation de « ${r.produitService.nom} » chez ${r.produitService.boutique.nom} a été annulée. Motif : ${motif}`
  );
  res.json({
    message: 'Réservation annulée, le client est prévenu',
    idReservation: r.idReservation,
    statut: 'ANNULEE',
    motifRefus: motif,
  });
});

module.exports = { lister, detail, accepter, refuser, annuler };