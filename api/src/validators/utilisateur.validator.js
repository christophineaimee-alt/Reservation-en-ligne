const { z } = require('zod');

const inscriptionSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est obligatoire'),
  prenom: z.string().trim().min(1, 'Le prénom est obligatoire'),
  email: z.string().trim().toLowerCase().email('E-mail invalide'),
  telephone: z.string().trim().min(9, 'Téléphone invalide').max(15, 'Téléphone invalide'),
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role: z.enum(['CLIENT', 'COMMERCANT']),
  adresse: z.string().trim().optional(),
  nomCommercial: z.string().trim().optional(),
});

const connexionSchema = z.object({
  identifiant: z.string().trim().min(1, 'Identifiant obligatoire'),
  motDePasse: z.string().min(1, 'Mot de passe obligatoire'),
});

module.exports = { inscriptionSchema, connexionSchema };