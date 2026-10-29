const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const { notifierAdmins } = require('../services/notificationService');

const OPERATEURS = [
  { code: 'MVOLA', nom: 'MVola' },
  { code: 'ORANGE_MONEY', nom: 'Orange Money' },
  { code: 'AIRTEL_MONEY', nom: 'Airtel Money' },
];

const validees = { statut: 'VALIDEE' };
const selectCategorie = { select: { idCategorie: true, nom: true } };
const selectClientPublic = { include: { utilisateur: { select: { prenom: true, nom: true } } } };

// Seuls les champs publics d'une boutique
function formaterBoutique(b) {
  return {
    idBoutique: b.idBoutique,
    nom: b.nom,
    description: b.description,
    adresse: b.adresse,
    ville: b.ville,
    logo: b.logo,
    telephone: b.telephone,
    noteMoyenne: b.noteMoyenne,
    nombreAvis: b.nombreAvis,
    categorie: b.categorie,
  };
}

// « Jean R. » : jamais le nom complet d'un client
function nomPublic(utilisateur) {
  const initiale = utilisateur.nom ? `${utilisateur.nom.charAt(0).toUpperCase()}.` : '';
  return `${utilisateur.prenom || ''} ${initiale}`.trim();
}

function formaterAvis(a) {
  return {
    idAvis: a.idAvis,
    note: a.note,
    commentaire: a.commentaire,
    reponse: a.reponse,
    createdAt: a.createdAt,
    client: nomPublic(a.client.utilisateur),
    boutique: a.boutique || undefined,
  };
}

function formaterPromotion(p) {
  return {
    idPromotion: p.idPromotion,
    titre: p.titre,
    description: p.description,
    typeRemise: p.typeRemise,
    valeur: Number(p.valeur),
    dateFin: p.dateFin,
    idProduitService: p.idProduitService,
    nomElement: p.produitService ? p.produitService.nom : null,
    boutique: p.boutique || undefined,
  };
}

function promotionsEnCours(maintenant) {
  return {
    actif: true,
    dateDebut: { lte: maintenant },
    dateFin: { gte: maintenant },
    OR: [{ idProduitService: null }, { produitService: { actif: true } }],
  };
}

// Catégories actives avec leur nombre de boutiques validées
async function categoriesAvecCompte() {
  const [categories, groupes] = await Promise.all([
    prisma.categorie.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
      select: { idCategorie: true, nom: true, description: true },
    }),
    prisma.boutique.groupBy({ by: ['idCategorie'], where: validees, _count: { _all: true } }),
  ]);
  const comptes = new Map(groupes.map((g) => [g.idCategorie, g._count._all]));
  return categories
    .map((c) => ({ ...c, nombreBoutiques: comptes.get(c.idCategorie) || 0 }))
    .sort((a, b) => b.nombreBoutiques - a.nombreBoutiques || a.nom.localeCompare(b.nom));
}

// Page d'accueil du visiteur : tout en un seul appel
const accueil = asyncHandler(async (req, res) => {
  const maintenant = new Date();
  const [nbBoutiques, nbCategories, nbClients, nbReservations, avisAgr, categories, vedettes, nouvelles, promotions, avis] =
    await Promise.all([
      prisma.boutique.count({ where: validees }),
      prisma.categorie.count({ where: { actif: true } }),
      prisma.client.count(),
      prisma.reservation.count({ where: { statut: 'ACCEPTEE' } }),
      prisma.avis.aggregate({ _avg: { note: true }, _count: true }),
      categoriesAvecCompte(),
      prisma.boutique.findMany({
        where: validees,
        orderBy: [{ noteMoyenne: 'desc' }, { nombreAvis: 'desc' }, { createdAt: 'desc' }],
        take: 6,
        include: { categorie: selectCategorie },
      }),
      prisma.boutique.findMany({
        where: validees,
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { categorie: selectCategorie },
      }),
      prisma.promotion.findMany({
        where: { ...promotionsEnCours(maintenant), boutique: validees },
        include: {
          produitService: { select: { nom: true } },
          boutique: { select: { idBoutique: true, nom: true, ville: true } },
        },
        orderBy: { dateFin: 'asc' },
        take: 6,
      }),
      prisma.avis.findMany({
        where: { commentaire: { not: null }, boutique: validees },
        include: { client: selectClientPublic, boutique: { select: { idBoutique: true, nom: true } } },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    ]);

  res.json({
    statistiques: {
      boutiques: nbBoutiques,
      categories: nbCategories,
      clients: nbClients,
      reservationsAcceptees: nbReservations,
      avis: avisAgr._count,
      noteMoyenne: avisAgr._avg.note ? Math.round(avisAgr._avg.note * 10) / 10 : 0,
    },
    categories,
    boutiquesVedettes: vedettes.map(formaterBoutique),
    nouvellesBoutiques: nouvelles.map(formaterBoutique),
    promotions: promotions.map(formaterPromotion),
    avisRecents: avis
      .filter((a) => a.commentaire && a.commentaire.trim().length > 0)
      .slice(0, 6)
      .map(formaterAvis),
    operateursPaiement: OPERATEURS,
  });
});

const categories = asyncHandler(async (req, res) => {
  res.json({ categories: await categoriesAvecCompte() });
});

// Fiche complète d'une boutique validée
const fiche = asyncHandler(async (req, res) => {
  const idBoutique = parseId(req.params.id);
  const boutique = await prisma.boutique.findFirst({
    where: { idBoutique, ...validees },
    include: { categorie: selectCategorie, horaires: { orderBy: { jour: 'asc' } } },
  });
  if (!boutique) throw new AppError('Boutique introuvable', 404);

  const maintenant = new Date();
  const [nombreArticles, prixMin, promotions, groupes, avis] = await Promise.all([
    prisma.produitService.count({ where: { idBoutique, actif: true } }),
    prisma.produitService.aggregate({ where: { idBoutique, actif: true }, _min: { prix: true } }),
    prisma.promotion.findMany({
      where: { idBoutique, ...promotionsEnCours(maintenant) },
      include: { produitService: { select: { nom: true } } },
      orderBy: { dateFin: 'asc' },
      take: 5,
    }),
    prisma.avis.groupBy({ by: ['note'], where: { idBoutique }, _count: { _all: true } }),
    prisma.avis.findMany({
      where: { idBoutique, commentaire: { not: null } },
      include: { client: selectClientPublic },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const repartition = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const g of groupes) repartition[g.note] = g._count._all;

  res.json({
    boutique: {
      ...formaterBoutique(boutique),
      horaires: boutique.horaires.map((h) => ({
        jour: h.jour,
        heureOuverture: h.heureOuverture,
        heureFermeture: h.heureFermeture,
        ferme: h.ferme,
      })),
    },
    catalogue: {
      nombreArticles,
      aPartirDe: prixMin._min.prix !== null ? Number(prixMin._min.prix) : null,
    },
    promotions: promotions.map(formaterPromotion),
    avis: {
      resume: { noteMoyenne: boutique.noteMoyenne, nombreAvis: boutique.nombreAvis, repartition },
      recents: avis.filter((a) => a.commentaire && a.commentaire.trim().length > 0).map(formaterAvis),
    },
  });
});

// Anti-spam simple : 5 messages par heure et par adresse
const ENVOIS = new Map();
const MAX_PAR_HEURE = 5;

function tropDEnvois(ip) {
  const maintenant = Date.now();
  const recents = (ENVOIS.get(ip) || []).filter((t) => maintenant - t < 60 * 60 * 1000);
  if (recents.length >= MAX_PAR_HEURE) {
    ENVOIS.set(ip, recents);
    return true;
  }
  recents.push(maintenant);
  ENVOIS.set(ip, recents);
  return false;
}

// Formulaire « Nous contacter »
const contact = asyncHandler(async (req, res) => {
  const reponse = { message: 'Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.' };
  // Champ piège rempli : c'est un robot, on répond poliment sans rien enregistrer
  if (req.body.siteWeb) return res.status(201).json(reponse);
  if (tropDEnvois(req.ip)) throw new AppError('Trop de messages envoyés : réessayez dans une heure', 429);

  const { nom, email, sujet, message } = req.body;
  await prisma.messageContact.create({ data: { nom, email: email.toLowerCase(), sujet, message } });
  await notifierAdmins('NOUVEAU_MESSAGE', 'Nouveau message de contact', `${nom} : ${sujet}`);
  return res.status(201).json(reponse);
});

module.exports = { accueil, categories, fiche, contact };