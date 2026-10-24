const { z } = require('zod');
const { HEURE } = require('../utils/temps');

const heure = z.string().regex(HEURE, 'Heure invalide (format HH:mm)');

// jour : 0 = dimanche ... 6 = samedi
const jourSchema = z
  .object({
    jour: z.number().int().min(0).max(6),
    ferme: z.boolean().default(false),
    heureOuverture: heure.optional(),
    heureFermeture: heure.optional(),
  })
  .refine(
    (j) => j.ferme || (j.heureOuverture && j.heureFermeture && j.heureOuverture < j.heureFermeture),
    { message: "La fermeture doit être après l'ouverture", path: ['heureFermeture'] }
  );

const horairesSchema = z
  .object({
    horaires: z.array(jourSchema).min(1).max(7),
    confirmer: z.boolean().optional(),
  })
  .refine((d) => new Set(d.horaires.map((h) => h.jour)).size === d.horaires.length, {
    message: 'Un jour apparaît plusieurs fois',
    path: ['horaires'],
  });

module.exports = { horairesSchema };