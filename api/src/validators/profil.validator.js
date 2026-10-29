const { z } = require('zod');

const NOM = /^[\p{L}][\p{L}\s'’.-]*$/u;

const nom = (libelle) =>
  z
    .string()
    .trim()
    .min(1, `${libelle} est obligatoire`)
    .max(60, `${libelle} est trop long (60 caractères maximum)`)
    .regex(NOM, `${libelle} ne doit contenir que des lettres`);

const modifierProfilSchema = z
  .object({
    nom: nom('Le nom').optional(),
    prenom: nom('Le prénom').optional(),
    telephone: z.string().trim().min(1, 'Le numéro de téléphone est obligatoire').optional(),
  })
  .refine((d) => d.nom !== undefined || d.prenom !== undefined || d.telephone !== undefined, {
    message: 'Aucune modification demandée',
  });

const changerMotDePasseSchema = z
  .object({
    motDePasseActuel: z.string().min(1, 'Saisissez votre mot de passe actuel'),
    nouveauMotDePasse: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
      .max(72, 'Le mot de passe ne doit pas dépasser 72 caractères')
      .regex(/[A-Za-z]/, 'Le nouveau mot de passe doit contenir au moins une lettre')
      .regex(/\d/, 'Le nouveau mot de passe doit contenir au moins un chiffre'),
    confirmation: z.string().min(1, 'Confirmez le nouveau mot de passe'),
  })
  .refine((d) => d.nouveauMotDePasse === d.confirmation, {
    message: 'La confirmation ne correspond pas au nouveau mot de passe',
    path: ['confirmation'],
  });

module.exports = { modifierProfilSchema, changerMotDePasseSchema };