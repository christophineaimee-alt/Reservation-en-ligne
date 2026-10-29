const { z } = require('zod');

const contactSchema = z.object({
  nom: z.string().trim().min(2, 'Indiquez votre nom').max(80, 'Nom trop long'),
  email: z.string().trim().email('Adresse e-mail invalide').max(120, 'Adresse e-mail trop longue'),
  sujet: z.string().trim().min(3, 'Le sujet doit contenir au moins 3 caractères').max(120, 'Sujet trop long'),
  message: z
    .string()
    .trim()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne doit pas dépasser 1000 caractères'),
  // Champ piège invisible dans le formulaire : une personne le laisse vide, un robot le remplit
  siteWeb: z.string().max(200).optional(),
});

module.exports = { contactSchema };