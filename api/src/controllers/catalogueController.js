const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { promotionsActives, meilleurePromotion } = require('../services/promotionService');

function formater(article, promos = []) {
  const { stock, prix, ...reste } = article;
  const quantite = stock ? stock.quantite : 0;
  const prixNormal = Math.round(Number(prix));
  const meilleure = meilleurePromotion(promos, article.idProduitService, prixNormal);
  return {
    ...reste,
    prix: Number(prix),
    promotion: meilleure
      ? {
          idPromotion: meilleure.promotion.idPromotion,
          titre: meilleure.promotion.titre,
          typeRemise: meilleure.promotion.typeRemise,
          valeur: Number(meilleure.promotion.valeur),
          dateFin: meilleure.promotion.dateFin,
          prixPromo: prixNormal - meilleure.remise,
        }
      : null,
    quantiteDisponible: article.type === 'PRODUIT' ? quantite : undefined,
    disponible: article.type === 'SERVICE' ? true : quantite > 0,
  };
}

// UC05 : catalogue d'une boutique validée
const catalogue = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const boutique = await prisma.boutique.findFirst({
    where: { idBoutique: id, statut: 'VALIDEE' },
    select: { idBoutique: true, nom: true, description: true, adresse: true, ville: true },
  });
  if (!boutique) throw new AppError('Boutique introuvable', 404);

  const where = { idBoutique: id, actif: true };
  if (req.query.type) {
    if (!['PRODUIT', 'SERVICE'].includes(req.query.type)) throw new AppError('Type invalide', 400);
    where.type = req.query.type;
  }
  const articles = await prisma.produitService.findMany({
    where,
    include: { stock: true },
    orderBy: { nom: 'asc' },
  });
  
  const promos = await promotionsActives(id);

  res.json({
    boutique,
    total: articles.length,
    message: articles.length === 0 ? 'Aucun produit pour le moment' : undefined,
    articles: articles.map((a) => formater(a, promos)),
  });
});

// UC05 : détail d'un produit ou d'un service
const detail = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const article = await prisma.produitService.findFirst({
    where: { idProduitService: id, actif: true, boutique: { statut: 'VALIDEE' } },
    include: { stock: true, boutique: { select: { idBoutique: true, nom: true, ville: true } } },
  });
  if (!article) throw new AppError('Élément introuvable', 404);
    const promos = await promotionsActives(article.idBoutique);
    res.json({ article: formater(article, promos) });
});

// UC12 : catalogue du commerçant (éléments inactifs inclus)
const mesArticles = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const articles = await prisma.produitService.findMany({
    where: { idBoutique: boutique.idBoutique },
    include: { stock: true },
    orderBy: { nom: 'asc' },
  });
    const promos = await promotionsActives(boutique.idBoutique);
    res.json({ total: articles.length, articles: articles.map((a) => formater(a, promos)) });
});

// UC12 : ajouter
const creer = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const { quantite, seuilAlerte, ...donnees } = req.body;

  const data = { ...donnees, idBoutique: boutique.idBoutique };
  if (donnees.type === 'PRODUIT') {
    data.stock = { create: { quantite: quantite ?? 0, seuilAlerte: seuilAlerte ?? 0 } };
  }
  const article = await prisma.produitService.create({ data, include: { stock: true } });
  res.status(201).json({ message: 'Élément ajouté au catalogue', article: formater(article) });
});

// UC12 : modifier ou désactiver
const modifier = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const existant = await prisma.produitService.findFirst({
    where: { idProduitService: id, idBoutique: boutique.idBoutique },
  });
  if (!existant) throw new AppError('Élément introuvable', 404);

  const article = await prisma.produitService.update({
    where: { idProduitService: id },
    data: req.body,
    include: { stock: true },
  });
  res.json({ message: 'Catalogue mis à jour', article: formater(article) });
});

// UC12 : supprimer (refusé s'il y a des réservations en cours)
const supprimer = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const article = await prisma.produitService.findFirst({
    where: { idProduitService: id, idBoutique: boutique.idBoutique },
  });
  if (!article) throw new AppError('Élément introuvable', 404);

  const enCours = await prisma.reservation.count({
    where: { idProduitService: id, statut: { in: ['EN_ATTENTE', 'ACCEPTEE'] } },
  });
  if (enCours > 0) {
    throw new AppError(
      `Suppression refusée : ${enCours} réservation(s) en cours. Désactivez plutôt l'élément (PUT avec "actif": false).`,
      409
    );
  }

  const historique = await prisma.reservation.count({ where: { idProduitService: id } });
  if (historique > 0) {
    await prisma.produitService.update({ where: { idProduitService: id }, data: { actif: false } });
    return res.json({ message: "Élément désactivé : il a un historique de réservations qu'on conserve" });
  }

  await prisma.produitService.delete({ where: { idProduitService: id } });
  res.json({ message: 'Élément supprimé' });
});

module.exports = { catalogue, detail, mesArticles, creer, modifier, supprimer };