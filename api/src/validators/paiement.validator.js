const { z } = require('zod');

const payerSchema = z.object({
  operateur: z.enum(['MVOLA', 'ORANGE_MONEY', 'AIRTEL_MONEY'], {
    errorMap: () => ({ message: 'Choisissez MVOLA, ORANGE_MONEY ou AIRTEL_MONEY' }),
  }),
  telephone: z.string().trim().min(9, 'Numéro de téléphone invalide'),
});

module.exports = { payerSchema };