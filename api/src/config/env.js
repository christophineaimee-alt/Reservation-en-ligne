require('dotenv').config();

const requis = ['DATABASE_URL', 'JWT_SECRET'];
for (const cle of requis) {
  if (!process.env[cle]) {
    console.error(`Variable manquante dans .env : ${cle}`);
    process.exit(1);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  maxEchecs: 5,
  paiementMode: process.env.PAIEMENT_MODE || 'simulation',
  delaiPaiementMinutes: Number(process.env.DELAI_PAIEMENT_MINUTES) || 10,
};