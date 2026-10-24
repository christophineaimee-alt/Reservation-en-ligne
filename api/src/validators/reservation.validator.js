const { z } = require('zod');

// UC07 : le contrôleur vérifie ensuite le type (créneau pour un service, date de retrait pour un produit)
const creerReservationSchema = z.object({
  idProduitService: z.number({ invalid_type_error: 'idProduitService obligatoire' }).int().positive(),
  quantite: z.number().int().min(1, 'La quantité doit être au moins 1').optional(),
  remarque: z.string().trim().max(500, 'Remarque trop longue (500 caractères maximum)').optional(),
  idDisponibilite: z.number().int().positive().optional(),
  dateRetrait: z.string().trim().optional(),
});

// UC18 : motif de refus obligatoire
const refuserReservationSchema = z.object({
  motif: z.string().trim().min(1, 'Le motif de refus est obligatoire').max(300, 'Motif trop long'),
});

module.exports = { creerReservationSchema, refuserReservationSchema };