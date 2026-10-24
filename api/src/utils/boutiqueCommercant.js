const prisma = require('../config/prisma');
const AppError = require('./AppError');

async function boutiqueDuCommercant(idUser) {
  const commercant = await prisma.commercant.findUnique({
    where: { idUser },
    include: { boutique: true },
  });
  if (!commercant) throw new AppError('Profil commerçant introuvable', 403);
  if (!commercant.boutique) throw new AppError("Créez d'abord votre boutique", 404);
  return commercant.boutique;
}

module.exports = boutiqueDuCommercant;