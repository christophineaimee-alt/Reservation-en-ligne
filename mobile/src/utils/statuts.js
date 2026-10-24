import { couleurs } from '../theme';

function neutre(libelle) {
  return { libelle, couleur: couleurs.texteSecondaire, fond: '#E5E7EB' };
}

// ---- Réservations ----
export const STATUTS_RESERVATION = {
  EN_ATTENTE: { libelle: 'En attente', couleur: '#B7791F', fond: '#FFF4DB' },
  ACCEPTEE: { libelle: 'Acceptée', couleur: couleurs.succes, fond: couleurs.succesFond },
  REFUSEE: { libelle: 'Refusée', couleur: couleurs.erreur, fond: couleurs.erreurFond },
  ANNULEE: { libelle: 'Annulée', couleur: '#4B5563', fond: '#E5E7EB' },
  EXPIREE: { libelle: 'Expirée', couleur: '#4B5563', fond: '#E5E7EB' },
};

export function infoStatut(statut) {
  return STATUTS_RESERVATION[statut] || neutre(statut);
}

// Statuts d'une réservation encore active (annulable)
export const STATUTS_ACTIFS = ['EN_ATTENTE', 'ACCEPTEE'];

// ---- Boutiques ----
export const STATUTS_BOUTIQUE = {
  EN_ATTENTE: { libelle: 'En attente', couleur: '#B7791F', fond: '#FFF4DB' },
  VALIDEE: { libelle: 'Validée', couleur: couleurs.succes, fond: couleurs.succesFond },
  REJETEE: { libelle: 'Rejetée', couleur: couleurs.erreur, fond: couleurs.erreurFond },
};

export function infoStatutBoutique(statut) {
  return STATUTS_BOUTIQUE[statut] || neutre(statut);
}

// ---- Comptes utilisateurs ----
export const STATUTS_COMPTE = {
  ACTIF: { libelle: 'Actif', couleur: couleurs.succes, fond: couleurs.succesFond },
  SUSPENDU: { libelle: 'Suspendu', couleur: '#B7791F', fond: '#FFF4DB' },
  BLOQUE: { libelle: 'Bloqué', couleur: couleurs.erreur, fond: couleurs.erreurFond },
};

export function infoStatutCompte(statut) {
  return STATUTS_COMPTE[statut] || neutre(statut);
}

export const LIBELLES_ROLE = { CLIENT: 'Client', COMMERCANT: 'Commerçant', ADMIN: 'Administrateur' };

export function infoRole(role) {
  return { libelle: LIBELLES_ROLE[role] || role, couleur: couleurs.primaire, fond: couleurs.primaireClair };
}