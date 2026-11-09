const { z } = require('zod');

const email = z.string().trim().toLowerCase().email('E-mail invalide');
const code = z.string().trim().regex(/^\d{6}$/, 'Le code contient 6 chiffres');

const verifierCodeSchema = z.object({ email, code });
const renvoyerCodeSchema = z.object({ email });

const motDePasseOublieSchema = z.object({ email });
const reinitialiserSchema = z.object({
  email,
  code,
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

module.exports = { verifierCodeSchema, renvoyerCodeSchema, motDePasseOublieSchema, reinitialiserSchema };