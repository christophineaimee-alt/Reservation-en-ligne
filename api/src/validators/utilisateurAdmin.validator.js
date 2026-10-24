const { z } = require('zod');

const actionUtilisateurSchema = z.object({
  action: z.enum(['SUSPENDRE', 'REACTIVER', 'SUPPRIMER'], {
    errorMap: () => ({ message: 'Action invalide (SUSPENDRE, REACTIVER ou SUPPRIMER)' }),
  }),
});

module.exports = { actionUtilisateurSchema };