const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authentifier = asyncHandler(async (req, res, next) => {
  const entete = req.headers.authorization || '';
  const [type, jeton] = entete.split(' ');
  if (type !== 'Bearer' || !jeton) throw new AppError('Jeton manquant', 401);

  let payload;
  try {
    payload = jwt.verify(jeton, env.jwtSecret);
  } catch (e) {
    throw new AppError('Jeton invalide ou expiré', 401);
  }

  const utilisateur = await prisma.utilisateur.findUnique({ where: { idUser: payload.idUser } });
  if (!utilisateur || utilisateur.statutCompte !== 'ACTIF') {
    throw new AppError('Compte indisponible', 403);
  }
  req.utilisateur = utilisateur;
  next();
});

const autoriser = (...roles) => (req, res, next) => {
  if (!req.utilisateur || !roles.includes(req.utilisateur.role)) {
    return next(new AppError('Accès refusé', 403));
  }
  next();
};

module.exports = { authentifier, autoriser };