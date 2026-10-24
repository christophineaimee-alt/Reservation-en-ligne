const { z } = require('zod');

const note = z
  .number()
  .int('La note doit être un nombre entier')
  .min(1, 'La note minimale est 1')
  .max(5, 'La note maximale est 5');
const commentaire = z.string().trim().max(500, 'Le commentaire ne doit pas dépasser 500 caractères').optional();

const creerAvisSchema = z.object({
  idReservation: z.number().int().positive(),
  note,
  commentaire,
});

const modifierAvisSchema = z.object({ note, commentaire });

const reponseSchema = z.object({
  reponse: z.string().trim().min(1, 'La réponse est vide').max(500, 'La réponse ne doit pas dépasser 500 caractères'),
});

module.exports = { creerAvisSchema, modifierAvisSchema, reponseSchema };