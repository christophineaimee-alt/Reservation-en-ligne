const AppError = require('./AppError');

module.exports = (valeur) => {
  const n = Number(valeur);
  if (!Number.isInteger(n) || n <= 0) throw new AppError('Identifiant invalide', 400);
  return n;
};