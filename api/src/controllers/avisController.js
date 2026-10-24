const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { notifier } = require('../services/notificationService');

async function clientConnecte(idUser) {
  const client = await prisma.client.findUnique({ where: { idUser } });
  if (!client) throw new AppError('Profil client introuvable', 403);
  return client;
}

// Recalcule la note moyenne (une décimale) et le nombre d'avis d'une boutique
async function recalculerNote(db, idBoutique) {
  const agr = await db.avis.aggregate({ where: { idBoutique }, _avg: { note: true }, _count: true });
  const moyenne = agr._avg.note ? Math.round(agr._avg.note * 10) / 10 : 0;
  await db.boutique.update({ where: { idBoutique }, data: { noteMoyenne: moyenne, nombreAvis: agr._count } });
}

// « Jean R. » : on ne publie ni le nom complet ni les coordonnées du client
function nomPublic(utilisateur) {
  const initiale = utilisateur.nom ? `${utilisateur.nom.charAt(0).toUpperCase()}.` : '';
  return `${utilisateur.prenom || ''} ${initiale}`.trim();
}

function formater(a) {
  return {
    idAvis: a.idAvis,
    idReservation: a.idReservation,
    note: a.note,
    commentaire: a.commentaire,
    reponse: a.reponse,
    dateReponse: a.dateReponse,
    createdAt: a.createdAt,
    client: a.client ? nomPublic(a.client.utilisateur) : undefined,
    nomElement:
      a.reservation && a.reservation.produitService ? a.reservation.produitService.nom : undefined,
  };
}

async function resume(idBoutique) {
  const [boutique, groupes] = await Promise.all([
    prisma.boutique.findUnique({ where: { idBoutique }, select: { noteMoyenne: true, nombreAvis: true } }),
    prisma.avis.groupBy({ by: ['note'], where: { idBoutique }, _count: { _all: true } }),
  ]);
  const repartition = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const g of groupes) repartition[g.note] = g._count._all;
  return {
    noteMoyenne: boutique ? boutique.noteMoyenne : 0,
    nombreAvis: boutique ? boutique.nombreAvis : 0,
    repartition,
  };
}

function pagination(req) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 10, 1), 50);
  return { page, limite };
}

const includeListe = {
  client: { include: { utilisateur: { select: { prenom: true, nom: true } } } },
  reservation: { select: { produitService: { select: { nom: true } } } },
};

// Le client donne son avis sur une réservation passée
const creer = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const { idReservation, note, commentaire } = req.body;

  const reservation = await prisma.reservation.findFirst({
    where: { idReservation, idClient: client.idClient },
    include: {
      avis: true,
      produitService: {
        include: { boutique: { include: { commercant: { select: { idUser: true } } } } },
      },
    },
  });
  if (!reservation) throw new AppError('Réservation introuvable', 404);
  if (reservation.statut !== 'ACCEPTEE') {
    throw new AppError('Vous ne pouvez noter qu\'une réservation acceptée', 409);
  }
  if (reservation.dateHeure > new Date()) {
    throw new AppError('Vous pourrez donner votre avis après le rendez-vous', 409);
  }
  if (reservation.avis) {
    throw new AppError('Vous avez déjà donné votre avis sur cette réservation', 409);
  }

  const boutique = reservation.produitService.boutique;
  const avis = await prisma.$transaction(async (tx) => {
    const cree = await tx.avis.create({
      data: {
        note,
        commentaire: commentaire || null,
        idReservation,
        idClient: client.idClient,
        idBoutique: boutique.idBoutique,
      },
    });
    await recalculerNote(tx, boutique.idBoutique);
    return cree;
  });

  const extrait = commentaire ? ` : « ${commentaire.slice(0, 80)}${commentaire.length > 80 ? '…' : ''} »` : '';
  await notifier(
    boutique.commercant.idUser,
    'NOUVEL_AVIS',
    'Nouvel avis',
    `${note}/5 sur « ${reservation.produitService.nom} »${extrait}`
  );
  res.status(201).json({ message: 'Merci pour votre avis', avis: formater(avis) });
});

// Le client modifie son avis
const modifier = asyncHandler(async (req, res) => {
  const client = await clientConnecte(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const existant = await prisma.avis.findFirst({ where: { idAvis: id, idClient: client.idClient } });
  if (!existant) throw new AppError('Avis introuvable', 404);

  const { note, commentaire } = req.body;
  const avis = await prisma.$transaction(async (tx) => {
    const maj = await tx.avis.update({
      where: { idAvis: id },
      data: { note, commentaire: commentaire || null },
    });
    await recalculerNote(tx, existant.idBoutique);
    return maj;
  });
  res.json({ message: 'Avis modifié', avis: formater(avis) });
});

// Public : les avis d'une boutique validée, avec le résumé (moyenne et répartition)
const listerBoutique = asyncHandler(async (req, res) => {
  const idBoutique = parseId(req.params.id);
  const boutique = await prisma.boutique.findFirst({
    where: { idBoutique, statut: 'VALIDEE' },
    select: { idBoutique: true },
  });
  if (!boutique) throw new AppError('Boutique introuvable', 404);

  const { page, limite } = pagination(req);
  const [liste, resumeAvis] = await Promise.all([
    prisma.avis.findMany({
      where: { idBoutique },
      include: includeListe,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
    resume(idBoutique),
  ]);
  res.json({ resume: resumeAvis, total: resumeAvis.nombreAvis, page, limite, avis: liste.map(formater) });
});

// Commerçant : les avis de sa boutique (sansReponse=true pour ceux qui attendent une réponse)
const listerCommercant = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const { page, limite } = pagination(req);
  const where = { idBoutique: boutique.idBoutique };
  if (req.query.sansReponse === 'true') where.reponse = null;

  const [liste, resumeAvis, sansReponse] = await Promise.all([
    prisma.avis.findMany({
      where,
      include: includeListe,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
    resume(boutique.idBoutique),
    prisma.avis.count({ where: { idBoutique: boutique.idBoutique, reponse: null } }),
  ]);
  res.json({ resume: resumeAvis, sansReponse, page, limite, avis: liste.map(formater) });
});

// Commerçant : répondre à un avis (la réponse est publique)
const repondre = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const avis = await prisma.avis.findFirst({
    where: { idAvis: id, idBoutique: boutique.idBoutique },
    include: { client: { select: { idUser: true } } },
  });
  if (!avis) throw new AppError('Avis introuvable', 404);

  const maj = await prisma.avis.update({
    where: { idAvis: id },
    data: { reponse: req.body.reponse, dateReponse: new Date() },
  });
  await notifier(avis.client.idUser, 'REPONSE_AVIS', 'Réponse à votre avis', `${boutique.nom} a répondu à votre avis.`);
  res.json({ message: 'Réponse publiée', avis: formater(maj) });
});

module.exports = { creer, modifier, listerBoutique, listerCommercant, repondre };