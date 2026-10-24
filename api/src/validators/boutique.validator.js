const { z } = require('zod');

const boutiqueBase = z.object({
  nom: z.string().trim().min(2, 'Le nom est obligatoire'),
  description: z.string().trim().optional(),
  adresse: z.string().trim().min(1, "L'adresse est obligatoire"),
  ville: z.string().trim().min(1, 'La ville est obligatoire'),
  telephone: z.string().trim().optional(),
  logo: z.string().trim().optional(),
  idCategorie: z.number({ invalid_type_error: 'La catégorie est obligatoire' }).int().positive('La catégorie est obligatoire'),
});

const creerBoutiqueSchema = boutiqueBase;

const modifierBoutiqueSchema = boutiqueBase
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucune modification fournie' });

const decisionSchema = z
  .object({
    decision: z.enum(['VALIDER', 'REJETER']),
    motif: z.string().trim().optional(),
  })
  .refine((d) => d.decision !== 'REJETER' || (d.motif && d.motif.length > 0), {
    message: 'Le motif de rejet est obligatoire',
    path: ['motif'],
  });

module.exports = { creerBoutiqueSchema, modifierBoutiqueSchema, decisionSchema };