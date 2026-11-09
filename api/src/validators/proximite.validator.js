const { z } = require('zod');

const positionSchema = z.object({
  latitude: z.coerce.number().min(-90, 'Latitude invalide (entre -90 et 90)').max(90, 'Latitude invalide (entre -90 et 90)'),
  longitude: z.coerce.number().min(-180, 'Longitude invalide (entre -180 et 180)').max(180, 'Longitude invalide (entre -180 et 180)'),
});

module.exports = { positionSchema };
