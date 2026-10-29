// Numéro malgache : 10 chiffres commençant par 032, 033, 034, 037 ou 038
export function normaliserTelephoneMG(texte) {
  if (typeof texte !== 'string') return null;
  let n = texte.replace(/[\s.\-()]/g, '');
  if (n.startsWith('+261')) n = `0${n.slice(4)}`;
  else if (n.startsWith('00261')) n = `0${n.slice(5)}`;
  else if (n.startsWith('261') && n.length === 12) n = `0${n.slice(3)}`;
  return /^03[23478]\d{7}$/.test(n) ? n : null;
}

// 0341234567 devient « 034 12 345 67 » ; une autre écriture est laissée telle quelle
export function formaterTelephone(numero) {
  const n = normaliserTelephoneMG(numero || '');
  if (!n) return numero || '';
  return `${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
}