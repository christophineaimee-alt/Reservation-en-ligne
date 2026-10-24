const { z } = require('zod');
const { HEURE, DATE } = require('../utils/temps');

const heure = z.string().regex(HEURE, 'Heure invalide (format HH:mm)');
const date = z.string().regex(DATE, 'Date invalide (format AAAA-MM-JJ)');
const capacite = z.number().int().min(1, 'La capacité doit être au moins 1');

const creerDisponibiliteSchema = z
  .object({
    date,
    heureDebut: heure,
    heureFin: heure,
    capacite: capacite.default(1),
  })
  .refine((d) => d.heureDebut < d.heureFin, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ['heureFin'],
  });

const modifierDisponibiliteSchema = z
  .object({
    heureDebut: heure.optional(),
    heureFin: heure.optional(),
    capacite: capacite.optional(),
    bloque: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucune modification fournie' });

const genererDisponibilitesSchema = z.object({
  dateDebut: date,
  dateFin: date,
  dureeMinutes: z.number().int().min(5).max(480),
  capacite: capacite.default(1),
});

module.exports = { creerDisponibiliteSchema, modifierDisponibiliteSchema, genererDisponibilitesSchema };