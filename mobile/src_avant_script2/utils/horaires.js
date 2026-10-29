const NOMS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// 0 = dimanche … 6 = samedi (comme dans l'API)
export function nomJour(jour) {
  return NOMS[jour] || '';
}

// Affichage de lundi à dimanche
export function trierSemaine(horaires) {
  return [...horaires].sort((a, b) => ((a.jour + 6) % 7) - ((b.jour + 6) % 7));
}

export function libelleHoraire(h) {
  if (h.ferme) return 'Fermé';
  if (h.heureOuverture && h.heureFermeture) return `${h.heureOuverture} - ${h.heureFermeture}`;
  return '—';
}