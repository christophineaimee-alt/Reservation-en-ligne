function notFound(req, res) {
  res.status(404).json({ message: 'Route introuvable' });
}

function errorHandler(err, req, res, next) {
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'Cette valeur existe déjà', champs: err.meta && err.meta.target });
  }
  const statut = err.statut || 500;
  if (statut === 500) console.error(err);
  res.status(statut).json({
    message: statut === 500 ? 'Erreur interne du serveur' : err.message,
    details: err.details,
  });
}

module.exports = { notFound, errorHandler };