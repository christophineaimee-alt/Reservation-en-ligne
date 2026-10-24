const cron = require('node-cron');
const { expirerReservations } = require('./reservationService');

let enCours = false;

async function tache() {
  if (enCours) return; // évite deux exécutions en même temps
  enCours = true;
  try {
    const total = await expirerReservations();
    if (total > 0) console.log(`[planificateur] ${total} réservation(s) expirée(s)`);
  } catch (e) {
    console.error('[planificateur] erreur :', e.message);
  } finally {
    enCours = false;
  }
}

function demarrer() {
  cron.schedule('* * * * *', tache);
  tache();
  console.log('Planificateur démarré (expiration des demandes, chaque minute)');
}

module.exports = { demarrer, tache };