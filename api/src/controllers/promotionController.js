const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { etatPromotion } = require('../services/promotionService');

// « 2026-10-30 » devient minuit (début) ou 23 h 59 (fin) à Madagascar ; un format complet est accepté tel quel
function lireDate(texte, finDeJournee) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(texte)) {
    return new Date(`${texte}T${finDeJournee ? '23:59:59' : '00:00:00'}+03:00`);
  }
  const d = new Date(texte);
  return Number.isNaN(d.getTime()) ? null : d;
}

function lireDates(body) {
  const dateDebut = lireDate(body.dateDebut, false);
  const dateFin = lireDate(body.dateFin, true);
  if (!dateDebut || !dateFin) throw new AppError('Dates invalides (format AAAA-MM-JJ)', 400);
  if (dateFin <= dateDebut) throw new AppError('La date de fin doit être après la date de début', 400);
  return { dateDebut, dateFin };
}

async function verifierArticle(idProduitService, idBoutique) {
  if (idProduitService === null || idProduitService === undefined) return null;
  const article = await prisma.produitService.findFirst({ where: { idProduitService, idBoutique } });
  if (!article) throw new AppError('Élément introuvable dans votre boutique', 400);
  return article.idProduitService;
}

function formater(p) {
  return {
    idPromotion: p.idPromotion,
    titre: p.titre,
    description: p.description,
    typeRemise: p.typeRemise,
    valeur: Number(p.valeur),
    dateDebut: p.dateDebut,
    dateFin: p.dateFin,
    actif: p.actif,
    etat: etatPromotion(p),
    idProduitService: p.idProduitService,
    nomElement: p.produitService ? p.produitService.nom : null,
  };
}

const includeArticle = { produitService: { select: { nom: true } } };

// Commerçant : ses promotions
const lister = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const promotions = await prisma.promotion.findMany({
    where: { idBoutique: boutique.idBoutique },
    include: includeArticle,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ total: promotions.length, promotions: promotions.map(formater) });
});

// Commerçant : créer une promotion
const creer = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const { dateDebut, dateFin } = lireDates(req.body);
  if (dateFin <= new Date()) throw new AppError('La date de fin est déjà passée', 400);
  const idProduitService = await verifierArticle(req.body.idProduitService, boutique.idBoutique);

  const promotion = await prisma.promotion.create({
    data: {
      titre: req.body.titre,
      description: req.body.description || null,
      typeRemise: req.body.typeRemise,
      valeur: req.body.valeur,
      dateDebut,
      dateFin,
      idBoutique: boutique.idBoutique,
      idProduitService,
    },
    include: includeArticle,
  });
  res.status(201).json({ message: 'Promotion créée', promotion: formater(promotion) });
});

// Commerçant : modifier une promotion
const modifier = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const existante = await prisma.promotion.findFirst({ where: { idPromotion: id, idBoutique: boutique.idBoutique } });
  if (!existante) throw new AppError('Promotion introuvable', 404);

  const { dateDebut, dateFin } = lireDates(req.body);
  const idProduitService = await verifierArticle(req.body.idProduitService, boutique.idBoutique);
  const promotion = await prisma.promotion.update({
    where: { idPromotion: id },
    data: {
      titre: req.body.titre,
      description: req.body.description || null,
      typeRemise: req.body.typeRemise,
      valeur: req.body.valeur,
      dateDebut,
      dateFin,
      idProduitService,
    },
    include: includeArticle,
  });
  res.json({ message: 'Promotion modifiée', promotion: formater(promotion) });
});

// Commerçant : activer ou désactiver
const basculer = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const existante = await prisma.promotion.findFirst({ where: { idPromotion: id, idBoutique: boutique.idBoutique } });
  if (!existante) throw new AppError('Promotion introuvable', 404);
  const promotion = await prisma.promotion.update({
    where: { idPromotion: id },
    data: { actif: req.body.actif },
    include: includeArticle,
  });
  res.json({ message: req.body.actif ? 'Promotion activée' : 'Promotion désactivée', promotion: formater(promotion) });
});

// Commerçant : supprimer (impossible si une réservation l'a déjà utilisée)
const supprimer = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const existante = await prisma.promotion.findFirst({ where: { idPromotion: id, idBoutique: boutique.idBoutique } });
  if (!existante) throw new AppError('Promotion introuvable', 404);
  const utilisations = await prisma.reservation.count({ where: { idPromotion: id } });
  if (utilisations > 0) {
    throw new AppError('Cette promotion a déjà été utilisée : désactivez-la plutôt que de la supprimer', 409);
  }
  await prisma.promotion.delete({ where: { idPromotion: id } });
  res.json({ message: 'Promotion supprimée' });
});

// Public : promotions en cours (option : ?idBoutique=3)
const publiques = asyncHandler(async (req, res) => {
  const maintenant = new Date();
  const where = {
    actif: true,
    dateDebut: { lte: maintenant },
    dateFin: { gte: maintenant },
    boutique: { statut: 'VALIDEE' },
    OR: [{ idProduitService: null }, { produitService: { actif: true } }],
  };
  if (req.query.idBoutique !== undefined) where.idBoutique = parseId(req.query.idBoutique);

  const liste = await prisma.promotion.findMany({
    where,
    include: {
      produitService: { select: { nom: true } },
      boutique: { select: { idBoutique: true, nom: true, ville: true } },
    },
    orderBy: { dateFin: 'asc' },
    take: 50,
  });
  res.json({
    total: liste.length,
    promotions: liste.map((p) => ({ ...formater(p), boutique: p.boutique })),
  });
});

module.exports = { lister, creer, modifier, basculer, supprimer, publiques };