const { z } = require('zod');

const promotionSchema = z
  .object({
    titre: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caractères').max(100, 'Titre trop long'),
    description: z.string().trim().max(300, 'La description ne doit pas dépasser 300 caractères').optional(),
    typeRemise: z.enum(['POURCENTAGE', 'MONTANT'], {
      errorMap: () => ({ message: 'Choisissez POURCENTAGE ou MONTANT' }),
    }),
    valeur: z.number().positive('La remise doit être supérieure à 0'),
    dateDebut: z.string().trim().min(8, 'La date de début est obligatoire'),
    dateFin: z.string().trim().min(8, 'La date de fin est obligatoire'),
    idProduitService: z.number().int().positive().nullable().optional(),
  })
  .refine((d) => d.typeRemise !== 'POURCENTAGE' || d.valeur <= 90, {
    message: 'Le pourcentage ne peut pas dépasser 90',
    path: ['valeur'],
  });

const activationSchema = z.object({ actif: z.boolean() });

module.exports = { promotionSchema, activationSchema };