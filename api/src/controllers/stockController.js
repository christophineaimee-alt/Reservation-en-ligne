const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { notifier } = require('../services/notificationService');

async function produitDuCommercant(req) {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const article = await prisma.produitService.findFirst({
    where: { idProduitService: id, idBoutique: boutique.idBoutique },
    include: { stock: true },
  });
  if (!article) throw new AppError('Élément introuvable', 404);
  if (article.type !== 'PRODUIT') throw new AppError('Le stock ne concerne que les produits', 400);
  return article;
}

// UC13 : consulter le stock
const voir = asyncHandler(async (req, res) => {
  const article = await produitDuCommercant(req);
  res.json({
    produit: article.nom,
    stock: article.stock || { quantite: 0, seuilAlerte: 0 },
    indisponible: !article.stock || article.stock.quantite === 0,
  });
});

// UC13 : mettre à jour le stock (message 10 à 15 de la séquence)
const modifier = asyncHandler(async (req, res) => {
  const article = await produitDuCommercant(req);
  const { quantite, seuilAlerte } = req.body;

  const data = { quantite };
  if (seuilAlerte !== undefined) data.seuilAlerte = seuilAlerte;

  const stock = await prisma.stock.upsert({
    where: { idProduitService: article.idProduitService },
    update: data,
    create: { idProduitService: article.idProduitService, quantite, seuilAlerte: seuilAlerte ?? 0 },
  });

  const indisponible = stock.quantite === 0;
  let alerte = null;
  if (indisponible) {
    alerte = `Le produit « ${article.nom} » est en rupture de stock : il est indisponible.`;
    await notifier(req.utilisateur.idUser, 'STOCK_FAIBLE', 'Rupture de stock', alerte);
  } else if (stock.seuilAlerte > 0 && stock.quantite <= stock.seuilAlerte) {
    alerte = `Le stock du produit « ${article.nom} » est faible (${stock.quantite} restant).`;
    await notifier(req.utilisateur.idUser, 'STOCK_FAIBLE', 'Stock faible', alerte);
  }

  res.json({ message: 'Stock mis à jour', stock, indisponible, alerte });
});

module.exports = { voir, modifier };