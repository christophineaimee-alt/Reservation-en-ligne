const prisma = require('../config/prisma');

// Promotions en cours d'une boutique (propres à un article ou valables pour toute la boutique)
async function promotionsActives(idBoutique, db = prisma, maintenant = new Date()) {
  return db.promotion.findMany({
    where: {
      idBoutique,
      actif: true,
      dateDebut: { lte: maintenant },
      dateFin: { gte: maintenant },
    },
  });
}

// Montant de la remise (entier, en Ar), plafonné à 90 % du montant
function calculerRemise(promotion, montant) {
  const valeur = Number(promotion.valeur);
  const brute = promotion.typeRemise === 'POURCENTAGE' ? (montant * valeur) / 100 : valeur;
  const plafond = Math.floor(montant * 0.9);
  return Math.max(0, Math.min(Math.round(brute), plafond));
}

// Meilleure promotion applicable à un article pour un montant donné (pas de cumul)
function meilleurePromotion(promotions, idProduitService, montant) {
  let meilleure = null;
  for (const p of promotions) {
    if (p.idProduitService !== null && p.idProduitService !== idProduitService) continue;
    const remise = calculerRemise(p, montant);
    if (remise > 0 && (!meilleure || remise > meilleure.remise)) {
      meilleure = { promotion: p, remise };
    }
  }
  return meilleure;
}

// EN_COURS, A_VENIR, TERMINEE ou DESACTIVEE
function etatPromotion(p, maintenant = new Date()) {
  if (!p.actif) return 'DESACTIVEE';
  if (maintenant < p.dateDebut) return 'A_VENIR';
  if (maintenant > p.dateFin) return 'TERMINEE';
  return 'EN_COURS';
}

module.exports = { promotionsActives, calculerRemise, meilleurePromotion, etatPromotion };