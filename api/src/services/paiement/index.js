const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const simulateur = require('./simulateur');

// Les vrais opérateurs seront branchés ici : { MVOLA: require('./mvola'), ... }
const REELS = {};

function choisir(operateur) {
  if (env.paiementMode === 'simulation') return simulateur;
  const fournisseur = REELS[operateur];
  if (!fournisseur) throw new AppError(`L'opérateur ${operateur} n'est pas encore branché`, 501);
  return fournisseur;
}

module.exports = { choisir };