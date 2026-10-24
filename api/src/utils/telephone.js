const PREFIXES = {
  MVOLA: ['034', '038'],
  ORANGE_MONEY: ['032', '037'],
  AIRTEL_MONEY: ['033'],
};

const LIBELLES = {
  MVOLA: 'MVola',
  ORANGE_MONEY: 'Orange Money',
  AIRTEL_MONEY: 'Airtel Money',
};

function normaliser(numero) {
  let n = String(numero).replace(/[\s.\-()]/g, '');
  if (n.startsWith('+261')) n = '0' + n.slice(4);
  else if (n.startsWith('00261')) n = '0' + n.slice(5);
  else if (n.startsWith('261') && n.length === 12) n = '0' + n.slice(3);
  return n;
}

function controler(operateur, numero) {
  const n = normaliser(numero);
  if (!/^0\d{9}$/.test(n)) {
    return { ok: false, message: 'Numéro invalide : 10 chiffres attendus (ex. 034 12 345 67)' };
  }
  const prefixes = PREFIXES[operateur];
  if (!prefixes || !prefixes.includes(n.slice(0, 3))) {
    return {
      ok: false,
      message: `Ce numéro n'est pas un numéro ${LIBELLES[operateur] || operateur} (${(prefixes || []).join(' ou ')})`,
    };
  }
  return { ok: true, numero: n };
}

function masquer(numero) {
  return numero.slice(0, 3) + '*****' + numero.slice(-2);
}

module.exports = { PREFIXES, LIBELLES, normaliser, controler, masquer };