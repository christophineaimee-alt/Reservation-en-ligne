const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const boutiqueDuCommercant = require('../utils/boutiqueCommercant');
const { jourSemaineLocal } = require('../utils/temps');

const choixHoraire = { jour: true, heureOuverture: true, heureFermeture: true, ferme: true };

// UC14 : consulter les horaires (0 = dimanche ... 6 = samedi)
const lister = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const horaires = await prisma.horaire.findMany({
    where: { idBoutique: boutique.idBoutique },
    orderBy: { jour: 'asc' },
    select: choixHoraire,
  });
  res.json({
    total: horaires.length,
    message: horaires.length === 0 ? "Aucun horaire défini pour l'instant" : undefined,
    horaires,
  });
});

// UC14 : enregistrer les horaires
const modifier = asyncHandler(async (req, res) => {
  const boutique = await boutiqueDuCommercant(req.utilisateur.idUser);
  const { horaires, confirmer } = req.body;

  // Alternatif 3b : un jour fermé qui a des réservations à venir demande une confirmation
  const joursFermes = horaires.filter((h) => h.ferme).map((h) => h.jour);
  if (joursFermes.length > 0 && !confirmer) {
    const futures = await prisma.reservation.findMany({
      where: {
        statut: { in: ['EN_ATTENTE', 'ACCEPTEE'] },
        dateHeure: { gte: new Date() },
        produitService: { idBoutique: boutique.idBoutique },
      },
      select: { dateHeure: true },
    });
    const concernees = futures.filter((r) => joursFermes.includes(jourSemaineLocal(r.dateHeure)));
    if (concernees.length > 0) {
      throw new AppError(
        `${concernees.length} réservation(s) à venir tombent un jour que vous fermez. Renvoyez la requête avec "confirmer": true pour continuer.`,
        409,
        { reservationsConcernees: concernees.length }
      );
    }
  }

  await prisma.$transaction(
    horaires.map((h) => {
      const valeurs = {
        ferme: h.ferme,
        heureOuverture: h.ferme ? null : h.heureOuverture,
        heureFermeture: h.ferme ? null : h.heureFermeture,
      };
      return prisma.horaire.upsert({
        where: { idBoutique_jour: { idBoutique: boutique.idBoutique, jour: h.jour } },
        update: valeurs,
        create: { idBoutique: boutique.idBoutique, jour: h.jour, ...valeurs },
      });
    })
  );

  const maj = await prisma.horaire.findMany({
    where: { idBoutique: boutique.idBoutique },
    orderBy: { jour: 'asc' },
    select: choixHoraire,
  });
  res.json({ message: 'Horaires enregistrés', horaires: maj });
});

module.exports = { lister, modifier };