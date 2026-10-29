import { couleurs } from '../theme';
import { formatPrix } from './format';

// Même règle que le serveur : la remise ne dépasse jamais 90 % du montant
export function calculerRemise(promotion, montant) {
  if (!promotion) return 0;
  const valeur = Number(promotion.valeur);
  const brute = promotion.typeRemise === 'POURCENTAGE' ? (montant * valeur) / 100 : valeur;
  return Math.max(0, Math.min(Math.round(brute), Math.floor(montant * 0.9)));
}

// « -20 % » ou « -2 000 Ar »
export function libelleRemise(promotion) {
  const valeur = Number(promotion.valeur);
  return promotion.typeRemise === 'POURCENTAGE' ? `-${valeur} %` : `-${formatPrix(valeur)}`;
}

export const ETATS_PROMOTION = {
  EN_COURS: { texte: 'En cours', fond: couleurs.succesFond, couleur: couleurs.succes },
  A_VENIR: { texte: 'À venir', fond: couleurs.primaireClair, couleur: couleurs.primaire },
  TERMINEE: { texte: 'Terminée', fond: couleurs.neutreFond, couleur: couleurs.texteSecondaire },
  DESACTIVEE: { texte: 'Désactivée', fond: couleurs.avertFond, couleur: couleurs.attention },
};

function deuxChiffres(n) {
  return String(n).padStart(2, '0');
}

// 30/10
export function jourMois(dateIso) {
  const d = new Date(dateIso);
  return `${deuxChiffres(d.getDate())}/${deuxChiffres(d.getMonth() + 1)}`;
}

// 30/10/2026
export function dateCourte(dateIso) {
  const d = new Date(dateIso);
  return `${jourMois(dateIso)}/${d.getFullYear()}`;
}