const { z } = require('zod');

const prix = z.number().nonnegative('Le prix ne peut pas être négatif');

const creerProduitServiceSchema = z
  .object({
    nom: z.string().trim().min(1, 'Le nom est obligatoire'),
    description: z.string().trim().optional(),
    prix,
    photo: z.string().trim().optional(),
    type: z.enum(['PRODUIT', 'SERVICE']),
    dureeMinutes: z.number().int().positive('La durée doit être positive').optional(),
    quantite: z.number().int().nonnegative('La quantité ne peut pas être négative').optional(),
    seuilAlerte: z.number().int().nonnegative().optional(),
  })
  .refine((d) => d.type !== 'SERVICE' || d.dureeMinutes, {
    message: 'La durée est obligatoire pour un service',
    path: ['dureeMinutes'],
  });

const modifierProduitServiceSchema = z
  .object({
    nom: z.string().trim().min(1, 'Le nom est obligatoire').optional(),
    description: z.string().trim().optional(),
    prix: prix.optional(),
    photo: z.string().trim().optional(),
    dureeMinutes: z.number().int().positive('La durée doit être positive').optional(),
    actif: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucune modification fournie' });

const stockSchema = z.object({
  quantite: z.number().int('La quantité doit être un entier').nonnegative('La quantité ne peut pas être négative'),
  seuilAlerte: z.number().int().nonnegative('Le seuil ne peut pas être négatif').optional(),
});

module.exports = { creerProduitServiceSchema, modifierProduitServiceSchema, stockSchema };