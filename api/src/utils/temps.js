const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const FUSEAU = 'Indian/Antananarivo';

// "2026-10-25" -> Date UTC (ou null si invalide)
function dateUTC(texte) {
  if (!DATE.test(texte)) return null;
  const d = new Date(`${texte}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== texte) return null;
  return d;
}

function enMinutes(h) {
  const [a, b] = h.split(':').map(Number);
  return a * 60 + b;
}

function enHeure(m) {
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

// 0 = dimanche ... 6 = samedi, selon le fuseau de Madagascar
function jourSemaineLocal(date) {
  const nom = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: FUSEAU }).format(date);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(nom);
}

function aujourdhui() {
  return new Date().toLocaleDateString('en-CA', { timeZone: FUSEAU });
}

function heureActuelle() {
  return new Date().toLocaleTimeString('en-GB', { timeZone: FUSEAU, hour: '2-digit', minute: '2-digit', hour12: false });
}

module.exports = { HEURE, DATE, dateUTC, enMinutes, enHeure, jourSemaineLocal, aujourdhui, heureActuelle };