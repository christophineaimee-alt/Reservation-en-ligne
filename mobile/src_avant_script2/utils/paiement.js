import { couleurs } from '../theme';

// Opérateurs de paiement mobile à Madagascar
export const OPERATEURS = [
  { code: 'MVOLA', nom: 'MVola', lettre: 'M', couleur: '#E5A400', indice: '034 ou 038' },
  { code: 'ORANGE_MONEY', nom: 'Orange Money', lettre: 'O', couleur: '#FF7900', indice: '032 ou 037' },
  { code: 'AIRTEL_MONEY', nom: 'Airtel Money', lettre: 'A', couleur: '#E4002B', indice: '033' },
];

export function nomOperateur(code) {
  const operateur = OPERATEURS.find((o) => o.code === code);
  return operateur ? operateur.nom : code;
}

export const STATUTS_PAIEMENT = {
  REUSSI: { texte: 'Réussi', fond: couleurs.succesFond, couleur: couleurs.succes },
  EN_ATTENTE: { texte: 'En cours', fond: couleurs.primaireClair, couleur: couleurs.primaire },
  ECHOUE: { texte: 'Échoué', fond: couleurs.erreurFond, couleur: couleurs.erreur },
  EXPIRE: { texte: 'Expiré', fond: couleurs.neutreFond, couleur: couleurs.texteSecondaire },
};