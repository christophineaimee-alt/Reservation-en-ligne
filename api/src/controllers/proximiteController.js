const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');

const RAYON_TERRE_KM = 6371;
const MAX_RESULTATS = 50;

// Distance à vol d'oiseau entre deux points (formule de haversine), en kilomètres
function distanceKm(lat1, lng1, lat2, lng2) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(a));
}

// Texte vide ou absent : null ; texte non numérique : NaN
function nombre(valeur) {
  if (valeur === undefined || valeur === null || String(valeur).trim() === '') return null;
  return Number(String(valeur).replace(/\s/g, '').replace(',', '.'));
}

// Public : boutiques validées autour d'un point, avec recherche d'articles et tri par prix
// GET /proximite/boutiques?lat=-18.87&lng=47.50&rayon=10&q=robe&prixMin=20000&prixMax=300000&tri=distance|prix
const proches = asyncHandler(async (req, res) => {
  const lat = nombre(req.query.lat);
  const lng = nombre(req.query.lng);
  if (lat === null || lng === null || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw new AppError('Position invalide : lat et lng sont obligatoires', 400);
  }
  const rayonDemande = nombre(req.query.rayon);
  const rayon = Math.min(Math.max(Number.isFinite(rayonDemande) && rayonDemande ? rayonDemande : 10, 0.5), 200);
  const q = String(req.query.q || '').trim().slice(0, 60);
  const prixMin = nombre(req.query.prixMin);
  const prixMax = nombre(req.query.prixMax);
  if (Number.isNaN(prixMin) || Number.isNaN(prixMax)) throw new AppError('Les prix doivent être des nombres', 400);
  if (prixMin !== null && prixMax !== null && prixMin > prixMax) {
    throw new AppError('Le prix minimum dépasse le prix maximum', 400);
  }
  const tri = req.query.tri === 'prix' ? 'prix' : 'distance';
  const filtreArticles = Boolean(q) || prixMin !== null || prixMax !== null;

  // 1. Boîte englobante en base, puis distance exacte en mémoire
  const dLat = rayon / 111;
  const dLng = rayon / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
  const candidates = await prisma.boutique.findMany({
    where: {
      statut: 'VALIDEE',
      latitude: { gte: lat - dLat, lte: lat + dLat },
      longitude: { gte: lng - dLng, lte: lng + dLng },
    },
    select: {
      idBoutique: true,
      nom: true,
      adresse: true,
      ville: true,
      logo: true,
      telephone: true,
      noteMoyenne: true,
      nombreAvis: true,
      latitude: true,
      longitude: true,
    },
  });
  let boutiques = candidates
    .map((b) => ({ ...b, distanceKm: distanceKm(lat, lng, b.latitude, b.longitude) }))
    .filter((b) => b.distanceKm <= rayon);

  // 2. Articles correspondants (nom ou description, fourchette de prix), les moins chers d'abord
  const articlesParBoutique = new Map();
  if (boutiques.length > 0) {
    const wherePrix = {};
    if (prixMin !== null) wherePrix.gte = prixMin;
    if (prixMax !== null) wherePrix.lte = prixMax;
    const articles = await prisma.produitService.findMany({
      where: {
        idBoutique: { in: boutiques.map((b) => b.idBoutique) },
        actif: true,
        ...(Object.keys(wherePrix).length ? { prix: wherePrix } : {}),
        ...(q
          ? {
              OR: [
                { nom: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: { idProduitService: true, idBoutique: true, nom: true, prix: true, type: true },
      orderBy: { prix: 'asc' },
    });
    for (const a of articles) {
      if (!articlesParBoutique.has(a.idBoutique)) articlesParBoutique.set(a.idBoutique, []);
      articlesParBoutique.get(a.idBoutique).push({
        idProduitService: a.idProduitService,
        nom: a.nom,
        prix: Number(a.prix),
        type: a.type,
      });
    }
  }

  boutiques = boutiques.map((b) => {
    const liste = articlesParBoutique.get(b.idBoutique) || [];
    return {
      ...b,
      distanceKm: Math.round(b.distanceKm * 10) / 10,
      plusBasPrix: liste.length ? liste[0].prix : null,
      nombreArticles: liste.length,
      articles: liste.slice(0, 3),
    };
  });

  // Avec un filtre (mot-clé ou prix), seules les boutiques qui ont un article correspondant restent
  if (filtreArticles) boutiques = boutiques.filter((b) => b.nombreArticles > 0);

  boutiques.sort((a, b) => {
    if (tri === 'prix') {
      const pa = a.plusBasPrix === null ? Infinity : a.plusBasPrix;
      const pb = b.plusBasPrix === null ? Infinity : b.plusBasPrix;
      if (pa !== pb) return pa - pb;
    }
    return a.distanceKm - b.distanceKm;
  });

  res.json({
    centre: { lat, lng },
    rayon,
    tri,
    total: boutiques.length,
    boutiques: boutiques.slice(0, MAX_RESULTATS),
  });
});

// Commerçant : position actuelle de sa boutique
const maPosition = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const b = await prisma.boutique.findUnique({
    where: { idBoutique: boutique.idBoutique },
    select: { idBoutique: true, nom: true, adresse: true, ville: true, latitude: true, longitude: true },
  });
  res.json({ boutique: b });
});

// Commerçant : enregistrer la position de sa boutique
const definirPosition = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new AppError('Position invalide', 400);
  }
  const b = await prisma.boutique.update({
    where: { idBoutique: boutique.idBoutique },
    data: { latitude, longitude },
    select: { idBoutique: true, nom: true, latitude: true, longitude: true },
  });
  res.json({ message: 'Position de la boutique enregistrée', boutique: b });
});

module.exports = { proches, maPosition, definirPosition };
