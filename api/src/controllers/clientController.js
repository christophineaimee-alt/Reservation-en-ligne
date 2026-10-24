const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const S = require('../services/reservationService');

// UC19 : liste des clients de la boutique
const lister = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);

  const groupes = await prisma.reservation.groupBy({
    by: ['idClient'],
    where: { produitService: { idBoutique: boutique.idBoutique } },
    _count: { _all: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: 'desc' } },
    take: 200,
  });

  if (groupes.length === 0) {
    return res.json({ total: 0, message: 'Aucun client pour le moment', clients: [] });
  }

  const clients = await prisma.client.findMany({
    where: { idClient: { in: groupes.map((g) => g.idClient) } },
    select: { idClient: true, utilisateur: { select: { nom: true, prenom: true, telephone: true } } },
  });
  const parId = new Map(clients.map((c) => [c.idClient, c]));

  res.json({
    total: groupes.length,
    clients: groupes.map((g) => {
      const c = parId.get(g.idClient);
      return {
        idClient: g.idClient,
        nom: c.utilisateur.nom,
        prenom: c.utilisateur.prenom,
        telephone: c.utilisateur.telephone,
        nombreReservations: g._count._all,
        derniereReservation: g._max.createdAt,
      };
    }),
  });
});

// UC19 : fiche d'un client et ses réservations dans cette boutique
const detail = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);

  const reservations = await prisma.reservation.findMany({
    where: { idClient: id, produitService: { idBoutique: boutique.idBoutique } },
    include: S.inclureCommercant,
    orderBy: { createdAt: 'desc' },
  });
  // Un commerçant ne voit que les clients qui ont réservé chez lui
  if (reservations.length === 0) throw new AppError('Client introuvable', 404);

  const c = reservations[0].client;
  res.json({
    client: {
      idClient: c.idClient,
      nom: c.utilisateur.nom,
      prenom: c.utilisateur.prenom,
      telephone: c.utilisateur.telephone,
    },
    total: reservations.length,
    reservations: reservations.map(S.formater),
  });
});

module.exports = { lister, detail };