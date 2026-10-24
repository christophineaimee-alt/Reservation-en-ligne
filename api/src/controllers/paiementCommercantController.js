const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { aujourdhui } = require('../utils/temps');
const { formaterPaiement } = require('../services/paiementService');

function decalerJours(dateTexte, n) {
  const [a, m, j] = dateTexte.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10);
}

// Début de journée à Madagascar (UTC+3)
function debutLocal(dateTexte) {
  return new Date(`${dateTexte}T00:00:00+03:00`);
}

// Date locale (Madagascar) d'un instant, au format AAAA-MM-JJ
function jourLocal(date) {
  return new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Évaluation des paiements reçus par la boutique (periode = jour, semaine ou mois)
const evaluation = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const periode = req.query.periode || 'semaine';
  const retour = { jour: 0, semaine: 6, mois: 29 }[periode];
  if (retour === undefined) throw new AppError('Période invalide (jour, semaine ou mois)', 400);

  const aujourdhuiTexte = aujourdhui();
  const debutPeriode = debutLocal(decalerJours(aujourdhuiTexte, -retour));
  const debutSerie = debutLocal(decalerJours(aujourdhuiTexte, -6));
  const laBoutique = { reservation: { produitService: { idBoutique: boutique.idBoutique } } };
  const reussiPeriode = { ...laBoutique, statut: 'REUSSI', datePaiement: { gte: debutPeriode } };

  const [parStatutBrut, somme, parOperateurBrut, reussisSemaine, aPayer, recents] = await Promise.all([
    prisma.paiement.groupBy({
      by: ['statut'],
      where: { ...laBoutique, createdAt: { gte: debutPeriode } },
      _count: { _all: true },
    }),
    prisma.paiement.aggregate({ where: reussiPeriode, _sum: { montant: true }, _count: true }),
    prisma.paiement.groupBy({
      by: ['operateur'],
      where: reussiPeriode,
      _sum: { montant: true },
      _count: { _all: true },
    }),
    prisma.paiement.findMany({
      where: { ...laBoutique, statut: 'REUSSI', datePaiement: { gte: debutSerie } },
      select: { montant: true, datePaiement: true },
    }),
    prisma.reservation.findMany({
      where: {
        produitService: { idBoutique: boutique.idBoutique },
        statut: 'ACCEPTEE',
        dateHeure: { gt: new Date() },
        paiements: { none: { statut: 'REUSSI' } },
      },
      select: { quantite: true, montantTotal: true, produitService: { select: { prix: true } } },
    }),
    prisma.paiement.findMany({
      where: laBoutique,
      include: {
        reservation: {
          select: {
            produitService: { select: { nom: true } },
            client: { select: { utilisateur: { select: { nom: true, prenom: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const parStatut = { EN_ATTENTE: 0, REUSSI: 0, ECHOUE: 0, EXPIRE: 0 };
  for (const g of parStatutBrut) parStatut[g.statut] = g._count._all;
  const termines = parStatut.REUSSI + parStatut.ECHOUE + parStatut.EXPIRE;
  const tauxReussite = termines > 0 ? Math.round((parStatut.REUSSI * 100) / termines) : null;

  // Courbe : montants reçus par jour sur les 7 derniers jours
  const serie = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = decalerJours(aujourdhuiTexte, -i);
    serie.push({ date, libelle: String(Number(date.slice(8, 10))), valeur: 0 });
  }
  for (const p of reussisSemaine) {
    const jour = serie.find((s) => s.date === jourLocal(p.datePaiement));
    if (jour) jour.valeur += Number(p.montant);
  }

  const montantAEncaisser = aPayer.reduce((total, r) => {
    const montant = r.montantTotal !== null ? Number(r.montantTotal) : Number(r.produitService.prix) * r.quantite;
    return total + montant;
  }, 0);

  res.json({
    mode: env.paiementMode,
    periode,
    totalEncaisse: Number(somme._sum.montant || 0),
    nombrePayes: somme._count,
    tauxReussite,
    parStatut,
    parOperateur: parOperateurBrut
      .map((g) => ({ operateur: g.operateur, nombre: g._count._all, montant: Number(g._sum.montant || 0) }))
      .sort((a, b) => b.montant - a.montant),
    aEncaisser: { nombre: aPayer.length, montant: montantAEncaisser },
    serie,
    recents: recents.map((p) => ({
      ...formaterPaiement(p),
      nomElement: p.reservation.produitService.nom,
      client: `${p.reservation.client.utilisateur.prenom} ${p.reservation.client.utilisateur.nom}`,
    })),
  });
});

module.exports = { evaluation };