const { z } = require('zod');

const actionUtilisateurSchema = z.object({
  action: z.enum(['SUSPENDRE', 'REACTIVER', 'SUPPRIMER'], {
    errorMap: () => ({ message: 'Action invalide (SUSPENDRE, REACTIVER ou SUPPRIMER)' }),
  }),
});

// Création d'un administrateur : mot de passe plus strict que pour un client
const creerAdministrateurSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est obligatoire'),
  prenom: z.string().trim().min(1, 'Le prénom est obligatoire'),
  email: z.string().trim().toLowerCase().email('E-mail invalide'),
  telephone: z.string().trim().min(9, 'Téléphone invalide').max(15, 'Téléphone invalide'),
  motDePasse: z
    .string()
    .min(10, 'Le mot de passe doit contenir au moins 10 caractères')
    .regex(/[A-Za-z]/, 'Le mot de passe doit contenir une lettre')
    .regex(/\d/, 'Le mot de passe doit contenir un chiffre'),
});

module.exports = { actionUtilisateurSchema, creerAdministrateurSchema };