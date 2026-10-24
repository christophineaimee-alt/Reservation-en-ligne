const DELAI_CONFIRMATION_MS = 4000;

async function initier({ referenceInterne }) {
  return { referenceOperateur: `SIM-${referenceInterne}`, statut: 'EN_ATTENTE' };
}

async function verifier({ telephonePayeur, createdAt }) {
  const ecoule = Date.now() - new Date(createdAt).getTime();
  if (ecoule < DELAI_CONFIRMATION_MS) return { statut: 'EN_ATTENTE' };

  if (telephonePayeur.endsWith('77')) return { statut: 'EN_ATTENTE' };
  if (telephonePayeur.endsWith('00')) {
    return { statut: 'ECHOUE', messageErreur: 'Solde insuffisant (simulation)' };
  }
  if (telephonePayeur.endsWith('99')) {
    return { statut: 'ECHOUE', messageErreur: 'Paiement refusé par le client (simulation)' };
  }
  return { statut: 'REUSSI' };
}

module.exports = { nom: 'SIMULATEUR', initier, verifier };