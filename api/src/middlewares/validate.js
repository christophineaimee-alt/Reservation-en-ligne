const AppError = require('../utils/AppError');

module.exports = (schema) => (req, res, next) => {
  const resultat = schema.safeParse(req.body);
  if (!resultat.success) {
    const details = resultat.error.issues.map((i) => ({
      champ: i.path.join('.'),
      message: i.message,
    }));
    return next(new AppError('Données invalides', 400, details));
  }
  req.body = resultat.data;
  next();
};