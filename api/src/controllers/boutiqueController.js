const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const { notifier, notifierAdmins } = require('../services/notificationService');

const choixPublic = {
  idBoutique: true,
  nom: true,
  description: true,
  adresse: true,
  ville: true,
  logo: true,
  telephone: true,
  categorie: { select: { idCategorie: true, nom: true } },
  noteMoyenne: true,
  nombreAvis: true,
};

const choixHoraires = {
  orderBy: { jour: 'asc' },
  select: { jour: true, heureOuverture: true, heureFermeture: true, ferme: true },
};

const inclureAdmin = {
  categorie: { select: { idCategorie: true, nom: true } },
  commercant: {
    select: {
      nomCommercial: true,
      utilisateur: { select: { nom: true, prenom: true, telephone: true, email: true } },
    },
  },
};

async function boutiqueDuCommercant(idUser) {
  const commercant = await prisma.commercant.findUnique({
    where: { idUser },
    include: { boutique: true },
  });
  if (!commercant) throw new AppError('Profil commerçant introuvable', 403);
  return commercant;
}

// UC03 + UC04 : rechercher une boutique (mot-clé, ville, catégorie)
const rechercher = asyncHandler(async (req, res) => {
  const { q, ville, categorie } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 50);

  const where = { statut: 'VALIDEE', categorie: { actif: true } };
  if (categorie !== undefined) {
    const idCategorie = Number(categorie);
    if (!Number.isInteger(idCategorie) || idCategorie <= 0) throw new AppError('Catégorie invalide', 400);
    where.idCategorie = idCategorie;
  }
  if (ville) where.ville = { contains: String(ville), mode: 'insensitive' };
  if (q) {
    const mot = String(q);
    where.OR = [
      { nom: { contains: mot, mode: 'insensitive' } },
      { description: { contains: mot, mode: 'insensitive' } },
      { adresse: { contains: mot, mode: 'insensitive' } },
    ];
  }

  const [total, boutiques] = await Promise.all([
    prisma.boutique.count({ where }),
    prisma.boutique.findMany({
      where,
      select: choixPublic,
      orderBy: { nom: 'asc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
  ]);

  res.json({
    total,
    page,
    limite,
    message: total === 0 ? 'Aucune boutique trouvée' : undefined,
    boutiques,
  });
});

// Fiche d'une boutique validée (point de départ de UC05)
const detail = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const boutique = await prisma.boutique.findFirst({
    where: { idBoutique: id, statut: 'VALIDEE' },
    select: { ...choixPublic, horaires: choixHoraires },
  });
  if (!boutique) throw new AppError('Boutique introuvable', 404);
  res.json({ boutique });
});

// UC11 : créer sa boutique
const creer = asyncHandler(async (req, res) => {
  const commercant = await boutiqueDuCommercant(req.utilisateur.idUser);
  if (commercant.boutique) throw new AppError('Vous avez déjà une boutique', 409);

  const { nom, idCategorie } = req.body;
  const categorie = await prisma.categorie.findFirst({ where: { idCategorie, actif: true } });
  if (!categorie) throw new AppError('Catégorie introuvable ou inactive', 400);

  const nomPris = await prisma.boutique.findFirst({ where: { nom: { equals: nom, mode: 'insensitive' } } });
  if (nomPris) throw new AppError('Ce nom de boutique est déjà pris', 409);

  const boutique = await prisma.boutique.create({
    data: { ...req.body, idCommercant: commercant.idCommercant },
  });

  await notifierAdmins(
    'NOUVELLE_BOUTIQUE',
    'Nouvelle boutique à valider',
    `La boutique « ${boutique.nom} » attend votre validation.`,
    { type: 'BOUTIQUE', id: boutique.idBoutique }
  );
  

  res.status(201).json({ message: 'Boutique créée, en attente de validation', boutique });
});

const moi = asyncHandler(async (req, res) => {
  const commercant = await boutiqueDuCommercant(req.utilisateur.idUser);
  if (!commercant.boutique) throw new AppError("Vous n'avez pas encore de boutique", 404);
  const boutique = await prisma.boutique.findUnique({
    where: { idBoutique: commercant.boutique.idBoutique },
    include: { categorie: { select: { idCategorie: true, nom: true } }, horaires: choixHoraires },
  });
  res.json({ boutique });
});

// UC11 (variante) : modifier sa boutique ; une boutique rejetée est resoumise
const modifierMoi = asyncHandler(async (req, res) => {
  const commercant = await boutiqueDuCommercant(req.utilisateur.idUser);
  const boutique = commercant.boutique;
  if (!boutique) throw new AppError("Vous n'avez pas encore de boutique", 404);

  const data = { ...req.body };

  if (data.nom && data.nom.toLowerCase() !== boutique.nom.toLowerCase()) {
    const doublon = await prisma.boutique.findFirst({
      where: { nom: { equals: data.nom, mode: 'insensitive' }, NOT: { idBoutique: boutique.idBoutique } },
    });
    if (doublon) throw new AppError('Ce nom de boutique est déjà pris', 409);
  }
  if (data.idCategorie) {
    const categorie = await prisma.categorie.findFirst({ where: { idCategorie: data.idCategorie, actif: true } });
    if (!categorie) throw new AppError('Catégorie introuvable ou inactive', 400);
  }

  const resoumise = boutique.statut === 'REJETEE';
  if (resoumise) {
    data.statut = 'EN_ATTENTE';
    data.motifRejet = null;
    data.idAdminValidateur = null;
  }

  const maj = await prisma.boutique.update({ where: { idBoutique: boutique.idBoutique }, data });

  if (resoumise) {
    await notifierAdmins(
      'BOUTIQUE_RESOUMISE',
      'Boutique corrigée à revalider',
      `La boutique « ${maj.nom} » a été corrigée et attend une nouvelle validation.`,
      { type: 'BOUTIQUE', id: maj.idBoutique }
    );
    
  }
  res.json({
    message: resoumise ? 'Boutique corrigée et soumise à nouveau' : 'Boutique mise à jour',
    boutique: maj,
  });
});

// UC23 : liste des boutiques à valider (administrateur)
const listerAdmin = asyncHandler(async (req, res) => {
  const statut = req.query.statut || 'EN_ATTENTE';
  if (!['EN_ATTENTE', 'VALIDEE', 'REJETEE'].includes(statut)) throw new AppError('Statut invalide', 400);
  const boutiques = await prisma.boutique.findMany({
    where: { statut },
    orderBy: { createdAt: 'asc' },
    include: inclureAdmin,
  });
  res.json({ total: boutiques.length, boutiques });
});

// UC23 : détail d'une boutique (administrateur)
const detailAdmin = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const boutique = await prisma.boutique.findUnique({
    where: { idBoutique: id },
    include: { ...inclureAdmin, horaires: choixHoraires },
  });
  if (!boutique) throw new AppError('Boutique introuvable', 404);
  res.json({ boutique });
});

// UC23 : valider ou rejeter
const decider = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { decision, motif } = req.body;

  const boutique = await prisma.boutique.findUnique({ where: { idBoutique: id }, include: { commercant: true } });
  if (!boutique) throw new AppError('Boutique introuvable', 404);
  if (boutique.statut !== 'EN_ATTENTE') throw new AppError('Cette boutique a déjà été traitée', 409);

  const admin = await prisma.admin.findUnique({ where: { idUser: req.utilisateur.idUser } });
  if (!admin) throw new AppError('Profil administrateur introuvable', 403);

  const valider = decision === 'VALIDER';
  const maj = await prisma.boutique.update({
    where: { idBoutique: id },
    data: {
      statut: valider ? 'VALIDEE' : 'REJETEE',
      motifRejet: valider ? null : motif,
      idAdminValidateur: admin.idAdmin,
    },
  });

  await notifier(
    boutique.commercant.idUser,
    valider ? 'BOUTIQUE_VALIDEE' : 'BOUTIQUE_REJETEE',
    valider ? 'Boutique validée' : 'Boutique rejetée',
    valider
      ? `Votre boutique « ${boutique.nom} » est maintenant visible des clients.`
      : `Votre boutique « ${boutique.nom} » a été rejetée. Motif : ${motif}`,
    { type: 'BOUTIQUE', id }
  );
  

  res.json({ message: valider ? 'Boutique validée' : 'Boutique rejetée', boutique: maj });
});

module.exports = { rechercher, detail, creer, moi, modifierMoi, listerAdmin, detailAdmin, decider };