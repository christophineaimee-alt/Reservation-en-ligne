const { z } = require('zod');

const creerCategorieSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est obligatoire'),
  description: z.string().trim().optional(),
});

const modifierCategorieSchema = z
  .object({
    nom: z.string().trim().min(1, 'Le nom est obligatoire').optional(),
    description: z.string().trim().optional(),
    actif: z.boolean().optional(),
    reaffecterVers: z.number().int().positive().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucune modification fournie' });

module.exports = { creerCategorieSchema, modifierCategorieSchema };