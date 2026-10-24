const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');

// Liste publique (catégories actives) : sert à UC04
const lister = asyncHandler(async (req, res) => {
  const categories = await prisma.categorie.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' },
    select: { idCategorie: true, nom: true, description: true },
  });
  res.json({ total: categories.length, categories });
});

// UC24 : liste complète pour l'administrateur
const listerTous = asyncHandler(async (req, res) => {
  const categories = await prisma.categorie.findMany({
    orderBy: { nom: 'asc' },
    include: { _count: { select: { boutiques: true } } },
  });
  res.json({ total: categories.length, categories });
});

// UC24 : ajouter
const creer = asyncHandler(async (req, res) => {
  const { nom, description } = req.body;
  const existante = await prisma.categorie.findFirst({
    where: { nom: { equals: nom, mode: 'insensitive' } },
  });
  if (existante) throw new AppError('Une catégorie porte déjà ce nom', 409);

  const admin = await prisma.admin.findUnique({ where: { idUser: req.utilisateur.idUser } });
  const categorie = await prisma.categorie.create({
    data: { nom, description, idAdmin: admin ? admin.idAdmin : null },
  });
  res.status(201).json({ message: 'Catégorie créée', categorie });
});

// UC24 : renommer, modifier ou désactiver
const modifier = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { nom, description, actif, reaffecterVers } = req.body;

  const categorie = await prisma.categorie.findUnique({ where: { idCategorie: id } });
  if (!categorie) throw new AppError('Catégorie introuvable', 404);

  if (nom && nom.toLowerCase() !== categorie.nom.toLowerCase()) {
    const doublon = await prisma.categorie.findFirst({
      where: { nom: { equals: nom, mode: 'insensitive' }, NOT: { idCategorie: id } },
    });
    if (doublon) throw new AppError('Une catégorie porte déjà ce nom', 409);
  }

  const data = {};
  if (nom !== undefined) data.nom = nom;
  if (description !== undefined) data.description = description;
  if (actif !== undefined) data.actif = actif;

  const desactivation = actif === false && categorie.actif;
  if (desactivation) {
    const nb = await prisma.boutique.count({ where: { idCategorie: id } });
    if (nb > 0) {
      if (!reaffecterVers) {
        throw new AppError(
          `Désactivation bloquée : ${nb} boutique(s) rattachée(s). Indiquez "reaffecterVers" (identifiant d'une autre catégorie active).`,
          409
        );
      }
      if (reaffecterVers === id) throw new AppError('La catégorie de destination doit être différente', 400);
      const cible = await prisma.categorie.findFirst({ where: { idCategorie: reaffecterVers, actif: true } });
      if (!cible) throw new AppError('Catégorie de destination introuvable ou inactive', 400);

      const [, maj] = await prisma.$transaction([
        prisma.boutique.updateMany({ where: { idCategorie: id }, data: { idCategorie: reaffecterVers } }),
        prisma.categorie.update({ where: { idCategorie: id }, data }),
      ]);
      return res.json({ message: `Catégorie désactivée, ${nb} boutique(s) réaffectée(s)`, categorie: maj });
    }
  }

  const maj = await prisma.categorie.update({ where: { idCategorie: id }, data });
  res.json({ message: 'Catégorie mise à jour', categorie: maj });
});

module.exports = { lister, listerTous, creer, modifier };