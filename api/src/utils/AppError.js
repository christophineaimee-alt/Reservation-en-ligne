class AppError extends Error {
  constructor(message, statut = 400, details) {
    super(message);
    this.statut = statut;
    this.details = details;
  }
}

module.exports = AppError;