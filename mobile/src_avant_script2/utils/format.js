// Prix en ariary : 12000 -> "12 000 Ar"
export function formatPrix(valeur) {
  const nombre = Math.round(Number(valeur) || 0);
  return nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ar';
}

// 0 = dimanche ... 6 = samedi (comme dans l'API)
export const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Affichage du lundi au dimanche
export const ORDRE_JOURS = [1, 2, 3, 4, 5, 6, 0];

const JOURS_COURTS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export function libelleType(type) {
  return type === 'SERVICE' ? 'Service' : 'Produit';
}

// Première lettre en majuscule (pour les logos par défaut)
export function initiale(texte) {
  return (texte || '?').trim().charAt(0).toUpperCase();
}

function deuxChiffres(n) {
  return String(n).padStart(2, '0');
}

// Date -> "2026-10-21"
export function versYMD(date) {
  return `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}`;
}

// "2026-10-21" -> "mer. 21 oct."
export function formatDateTexte(ymd) {
  const [annee, mois, jour] = ymd.split('-').map(Number);
  const d = new Date(annee, mois - 1, jour);
  return `${JOURS_COURTS[d.getDay()]} ${jour} ${MOIS[mois - 1]}`;
}

// Date ISO du serveur -> "mer. 21 oct. à 14:30"
export function formatDateHeure(valeur) {
  const d = new Date(valeur);
  return `${JOURS_COURTS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} à ${deuxChiffres(d.getHours())}:${deuxChiffres(d.getMinutes())}`;
}

// Les 7 prochains jours, pour les puces de choix de date
export function prochainsJours(nombre = 7) {
  const liste = [];
  for (let i = 0; i < nombre; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const valeur = versYMD(d);
    let libelle = formatDateTexte(valeur);
    if (i === 0) libelle = "Aujourd'hui";
    if (i === 1) libelle = 'Demain';
    liste.push({ valeur, libelle });
  }
  return liste;
}

// Quand a lieu la réservation : créneau (service) ou date de retrait (produit)
export function libelleQuand(reservation) {
  if (reservation.creneau) {
    return `${formatDateTexte(reservation.creneau.date)} · ${reservation.creneau.heureDebut} - ${reservation.creneau.heureFin}`;
  }
  return formatDateHeure(reservation.dateHeure);
}