const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { aujourdhui } = require('../utils/temps');

function decalerJours(dateTexte, n) {
  const [a, m, j] = dateTexte.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10);
}

// Début de journée à Madagascar (UTC+3)
function debutLocal(dateTexte) {
  return new Date(`${dateTexte}T00:00:00+03:00`);
}

// UC20 : indicateurs de la boutique (periode = jour, semaine ou mois)
const indicateurs = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);

  const periode = req.query.periode || 'jour';
  const retour = { jour: 0, semaine: 6, mois: 29 }[periode];
  if (retour === undefined) throw new AppError('Période invalide (jour, semaine ou mois)', 400);

  const aujourdhuiTexte = aujourdhui();
  const debutPeriode = debutLocal(decalerJours(aujourdhuiTexte, -retour));
  const debutJour = debutLocal(aujourdhuiTexte);
  const debutDemain = debutLocal(decalerJours(aujourdhuiTexte, 1));
  const laBoutique = { produitService: { idBoutique: boutique.idBoutique } };

  const [parStatutBrut, enAttente, duJour, stocks] = await Promise.all([
    prisma.reservation.groupBy({
      by: ['statut'],
      where: { ...laBoutique, createdAt: { gte: debutPeriode } },
      _count: { _all: true },
    }),
    prisma.reservation.count({ where: { ...laBoutique, statut: 'EN_ATTENTE' } }),
    prisma.reservation.count({
      where: {
        ...laBoutique,
        statut: { in: ['EN_ATTENTE', 'ACCEPTEE'] },
        dateHeure: { gte: debutJour, lt: debutDemain },
      },
    }),
    prisma.stock.findMany({
      where: { produitService: { idBoutique: boutique.idBoutique, type: 'PRODUIT', actif: true } },
      include: { produitService: { select: { idProduitService: true, nom: true } } },
    }),
  ]);

  const parStatut = { EN_ATTENTE: 0, ACCEPTEE: 0, REFUSEE: 0, ANNULEE: 0, EXPIREE: 0 };
  for (const g of parStatutBrut) parStatut[g.statut] = g._count._all;
  const total = Object.values(parStatut).reduce((a, b) => a + b, 0);

  const traitees = parStatut.ACCEPTEE + parStatut.REFUSEE;
  const tauxAcceptation = traitees > 0 ? Math.round((parStatut.ACCEPTEE * 100) / traitees) : null;

  const stockFaible = stocks
    .filter((s) => s.quantite === 0 || (s.seuilAlerte > 0 && s.quantite <= s.seuilAlerte))
    .map((s) => ({
      idProduitService: s.produitService.idProduitService,
      nom: s.produitService.nom,
      quantite: s.quantite,
      seuilAlerte: s.seuilAlerte,
    }));

  res.json({
    periode,
    depuis: debutPeriode,
    message: total === 0 && enAttente === 0 ? 'Aucune donnée sur la période' : undefined,
    demandesEnAttente: enAttente,
    reservationsDuJour: duJour,
    reservationsPeriode: { total, parStatut },
    tauxAcceptation,
    stockFaible,
  });
});

module.exports = { indicateurs };