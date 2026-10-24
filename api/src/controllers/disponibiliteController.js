const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { dateUTC, enMinutes, enHeure, aujourdhui, heureActuelle } = require('../utils/temps');

const ACTIVES = ['EN_ATTENTE', 'ACCEPTEE'];

// Ajoute le nombre de places restantes à chaque créneau
async function avecPlaces(liste) {
  if (liste.length === 0) return [];
  const comptes = await prisma.reservation.groupBy({
    by: ['idDisponibilite'],
    where: { idDisponibilite: { in: liste.map((d) => d.idDisponibilite) }, statut: { in: ACTIVES } },
    _count: { _all: true },
  });
  const pris = new Map(comptes.map((c) => [c.idDisponibilite, c._count._all]));
  return liste.map((d) => ({
    idDisponibilite: d.idDisponibilite,
    date: d.date.toISOString().slice(0, 10),
    heureDebut: d.heureDebut,
    heureFin: d.heureFin,
    capacite: d.capacite,
    bloque: d.bloque,
    placesRestantes: Math.max(d.capacite - (pris.get(d.idDisponibilite) || 0), 0),
  }));
}

// UC15 inclut UC14 : un créneau doit respecter les horaires de la boutique
async function verifierHoraire(idBoutique, jour, debut, fin) {
  const h = await prisma.horaire.findUnique({ where: { idBoutique_jour: { idBoutique, jour } } });
  if (!h) throw new AppError("Définissez d'abord les horaires de la boutique", 409);
  if (h.ferme || !h.heureOuverture) throw new AppError('La boutique est fermée ce jour-là', 409);
  if (debut < h.heureOuverture || fin > h.heureFermeture) {
    throw new AppError(
      `Le créneau doit être dans les horaires d'ouverture (${h.heureOuverture} - ${h.heureFermeture})`,
      409
    );
  }
}

function chevauchement(idBoutique, date, debut, fin, exclure) {
  return prisma.disponibilite.findFirst({
    where: {
      idBoutique,
      date,
      heureDebut: { lt: fin },
      heureFin: { gt: debut },
      ...(exclure ? { NOT: { idDisponibilite: exclure } } : {}),
    },
  });
}

// UC06 : consulter les disponibilités d'un produit ou d'un service
const consulter = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const article = await prisma.produitService.findFirst({
    where: { idProduitService: id, actif: true, boutique: { statut: 'VALIDEE' } },
    include: { stock: true },
  });
  if (!article) throw new AppError('Élément introuvable', 404);

  if (article.type === 'PRODUIT') {
    const quantite = article.stock ? article.stock.quantite : 0;
    return res.json({
      type: 'PRODUIT',
      disponible: quantite > 0,
      quantite,
      message: quantite > 0 ? undefined : 'Produit indisponible (rupture de stock)',
    });
  }

  const dateTexte = req.query.date ? String(req.query.date) : aujourdhui();
  const jour = dateUTC(dateTexte);
  if (!jour) throw new AppError('Date invalide (format AAAA-MM-JJ)', 400);
  if (dateTexte < aujourdhui()) throw new AppError('Cette date est passée', 400);

  const liste = await prisma.disponibilite.findMany({
    where: { idBoutique: article.idBoutique, date: jour, bloque: false },
    orderBy: { heureDebut: 'asc' },
  });
  const creneaux = (await avecPlaces(liste)).filter(
    (d) => d.placesRestantes > 0 && (dateTexte !== aujourdhui() || d.heureDebut > heureActuelle())
  );
  if (creneaux.length > 0) {
    return res.json({ type: 'SERVICE', date: dateTexte, disponible: true, creneaux });
  }

  // Aucune disponibilité ce jour : on propose les prochaines dates
  const suivantes = await prisma.disponibilite.findMany({
    where: { idBoutique: article.idBoutique, bloque: false, date: { gt: jour } },
    orderBy: [{ date: 'asc' }, { heureDebut: 'asc' }],
    take: 100,
  });
  const libres = (await avecPlaces(suivantes)).filter((d) => d.placesRestantes > 0);
  res.json({
    type: 'SERVICE',
    date: dateTexte,
    disponible: false,
    message: 'Aucune disponibilité à cette date',
    prochainesDates: [...new Set(libres.map((d) => d.date))].slice(0, 3),
  });
});

// UC15 : consulter les créneaux de la boutique
const lister = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const where = { idBoutique: boutique.idBoutique };
  if (req.query.date) {
    const d = dateUTC(String(req.query.date));
    if (!d) throw new AppError('Date invalide (format AAAA-MM-JJ)', 400);
    where.date = d;
  } else {
    where.date = { gte: dateUTC(aujourdhui()) };
  }
  const liste = await prisma.disponibilite.findMany({
    where,
    orderBy: [{ date: 'asc' }, { heureDebut: 'asc' }],
    take: 500,
  });
  res.json({ total: liste.length, disponibilites: await avecPlaces(liste) });
});

// UC15 : ajouter un créneau
const creer = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const { date, heureDebut, heureFin, capacite } = req.body;

  const jour = dateUTC(date);
  if (!jour) throw new AppError('Date invalide', 400);
  if (date < aujourdhui()) throw new AppError('Cette date est passée', 400);

  await verifierHoraire(boutique.idBoutique, jour.getUTCDay(), heureDebut, heureFin);
  if (await chevauchement(boutique.idBoutique, jour, heureDebut, heureFin)) {
    throw new AppError('Ce créneau chevauche un créneau existant', 409);
  }

  const creneau = await prisma.disponibilite.create({
    data: { idBoutique: boutique.idBoutique, date: jour, heureDebut, heureFin, capacite },
  });
  res.status(201).json({ message: 'Créneau enregistré', creneau });
});

// UC15 : générer des créneaux à partir des horaires (durée et capacité au choix)
const generer = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const { dateDebut, dateFin, dureeMinutes, capacite } = req.body;

  const debut = dateUTC(dateDebut);
  const fin = dateUTC(dateFin);
  if (!debut || !fin) throw new AppError('Date invalide', 400);
  if (fin < debut) throw new AppError('La date de fin doit être après la date de début', 400);
  if (dateDebut < aujourdhui()) throw new AppError('La date de début est passée', 400);
  if ((fin - debut) / 86400000 + 1 > 31) throw new AppError('Maximum 31 jours à la fois', 400);

  const horaires = await prisma.horaire.findMany({ where: { idBoutique: boutique.idBoutique } });
  if (horaires.length === 0) throw new AppError("Définissez d'abord les horaires de la boutique", 409);
  const parJour = new Map(horaires.map((h) => [h.jour, h]));

  const existants = await prisma.disponibilite.findMany({
    where: { idBoutique: boutique.idBoutique, date: { gte: debut, lte: fin } },
    select: { date: true, heureDebut: true },
  });
  const cles = new Set(existants.map((e) => `${e.date.toISOString().slice(0, 10)}|${e.heureDebut}`));

  const aCreer = [];
  for (let t = debut.getTime(); t <= fin.getTime(); t += 86400000) {
    const d = new Date(t);
    const h = parJour.get(d.getUTCDay());
    if (!h || h.ferme || !h.heureOuverture) continue;
    const fermeture = enMinutes(h.heureFermeture);
    for (let m = enMinutes(h.heureOuverture); m + dureeMinutes <= fermeture; m += dureeMinutes) {
      const heureDebut = enHeure(m);
      if (cles.has(`${d.toISOString().slice(0, 10)}|${heureDebut}`)) continue;
      aCreer.push({
        idBoutique: boutique.idBoutique,
        date: d,
        heureDebut,
        heureFin: enHeure(m + dureeMinutes),
        capacite,
      });
    }
  }

  if (aCreer.length > 2000) throw new AppError('Trop de créneaux : réduisez la période', 400);
  if (aCreer.length === 0) {
    return res.json({ message: 'Aucun nouveau créneau à créer pour cette période', total: 0 });
  }
  const resultat = await prisma.disponibilite.createMany({ data: aCreer });
  res.status(201).json({ message: `${resultat.count} créneau(x) créé(s)`, total: resultat.count });
});

// UC15 : modifier un créneau (capacité, horaire, blocage)
const modifier = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const creneau = await prisma.disponibilite.findFirst({
    where: { idDisponibilite: id, idBoutique: boutique.idBoutique },
  });
  if (!creneau) throw new AppError('Créneau introuvable', 404);

  const { heureDebut, heureFin, capacite, bloque } = req.body;
  const debut = heureDebut ?? creneau.heureDebut;
  const fin = heureFin ?? creneau.heureFin;
  if (debut >= fin) throw new AppError("L'heure de fin doit être après l'heure de début", 400);

  const reservees = await prisma.reservation.count({
    where: { idDisponibilite: id, statut: { in: ACTIVES } },
  });
  if (bloque === true && !creneau.bloque && reservees > 0) {
    throw new AppError(
      `Créneau réservé (${reservees} réservation(s) en cours) : traitez d'abord ces réservations avant de le bloquer.`,
      409
    );
  }
  if (capacite !== undefined && capacite < reservees) {
    throw new AppError(`La capacité ne peut pas être inférieure aux ${reservees} réservation(s) en cours`, 409);
  }
  if ((heureDebut || heureFin) && reservees > 0) {
    throw new AppError("Impossible de changer l'horaire d'un créneau déjà réservé", 409);
  }
  if (heureDebut || heureFin) {
    await verifierHoraire(boutique.idBoutique, creneau.date.getUTCDay(), debut, fin);
    if (await chevauchement(boutique.idBoutique, creneau.date, debut, fin, id)) {
      throw new AppError('Ce créneau chevauche un créneau existant', 409);
    }
  }

  const data = {};
  if (heureDebut !== undefined) data.heureDebut = heureDebut;
  if (heureFin !== undefined) data.heureFin = heureFin;
  if (capacite !== undefined) data.capacite = capacite;
  if (bloque !== undefined) data.bloque = bloque;

  const maj = await prisma.disponibilite.update({ where: { idDisponibilite: id }, data });
  res.json({ message: 'Créneau mis à jour', creneau: maj });
});

// UC15 : supprimer un créneau
const supprimer = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const id = parseId(req.params.id);
  const creneau = await prisma.disponibilite.findFirst({
    where: { idDisponibilite: id, idBoutique: boutique.idBoutique },
  });
  if (!creneau) throw new AppError('Créneau introuvable', 404);

  const enCours = await prisma.reservation.count({ where: { idDisponibilite: id, statut: { in: ACTIVES } } });
  if (enCours > 0) throw new AppError(`Suppression refusée : ${enCours} réservation(s) en cours`, 409);

  const historique = await prisma.reservation.count({ where: { idDisponibilite: id } });
  if (historique > 0) {
    await prisma.disponibilite.update({ where: { idDisponibilite: id }, data: { bloque: true } });
    return res.json({ message: "Créneau bloqué : il a un historique de réservations qu'on conserve" });
  }
  await prisma.disponibilite.delete({ where: { idDisponibilite: id } });
  res.json({ message: 'Créneau supprimé' });
});

module.exports = { consulter, lister, creer, generer, modifier, supprimer };