export const REGEX_HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;

// "12" -> 12 ; "", "abc", "1.5" -> null
export function entier(texte) {
  const t = String(texte).trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

// "12000" ou "12000,50" -> nombre ; invalide ou négatif -> null
export function montant(texte) {
  const t = String(texte).trim().replace(',', '.');
  if (t === '' || Number.isNaN(Number(t))) return null;
  const n = Number(t);
  return n >= 0 ? n : null;
}