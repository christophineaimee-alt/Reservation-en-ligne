// Statut d'une réservation : texte et couleur de la pastille
export const PASTILLES_RESERVATION = {
  EN_ATTENTE: { texte: 'En attente', ton: 'attention' },
  ACCEPTEE: { texte: 'Acceptée', ton: 'succes' },
  REFUSEE: { texte: 'Refusée', ton: 'erreur' },
  ANNULEE: { texte: 'Annulée', ton: 'neutre' },
  EXPIREE: { texte: 'Expirée', ton: 'neutre' },
};

// Paiement d'une réservation : null si la notion n'a pas de sens (demande encore en attente, refusée…)
export function pastillePaiement(reservation) {
  if (reservation.paye) return { texte: 'Payé', ton: 'succes' };
  if (reservation.paiement && reservation.paiement.statut === 'EN_ATTENTE') return { texte: 'En cours', ton: 'primaire' };
  if (reservation.statut === 'ACCEPTEE') return { texte: 'À payer', ton: 'attention' };
  return null;
}