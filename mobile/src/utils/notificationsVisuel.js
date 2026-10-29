import { couleurs } from '../theme';

const T = (type) => String(type || '').toUpperCase();

// Genre de la notification, en clair
export function libelleType(type) {
  const t = T(type);
  if (t.includes('PAIEMENT')) return 'Paiement';
  if (t.includes('AVIS')) return 'Avis';
  if (t.includes('BOUTIQUE')) return 'Boutique';
  if (t.includes('STOCK')) return 'Stock';
  if (t.includes('MESSAGE')) return 'Message';
  if (t.includes('SECURITE')) return 'Sécurité';
  if (/RESERVATION|DEMANDE|ACCEPT|REFUS|ANNUL|EXPIR/.test(t)) return 'Réservation';
  return 'Notification';
}

// Icône et couleurs de la pastille
export function visuelNotification(type) {
  const accent = couleurs.accent || couleurs.primaire;
  const accentFond = couleurs.accentFond || couleurs.primaireClair;
  const turq = couleurs.turquoise || couleurs.primaire;
  const turqFond = couleurs.turquoiseFond || couleurs.primaireClair;
  switch (libelleType(type)) {
    case 'Paiement':
      return { icone: 'wallet-outline', couleur: turq, fond: turqFond };
    case 'Avis':
      return { icone: 'star-outline', couleur: accent, fond: accentFond };
    case 'Boutique':
      return { icone: 'storefront-outline', couleur: couleurs.primaire, fond: couleurs.primaireClair };
    case 'Stock':
      return { icone: 'cube-outline', couleur: couleurs.attention, fond: couleurs.attentionFond || accentFond };
    case 'Message':
      return { icone: 'mail-outline', couleur: couleurs.primaire, fond: couleurs.primaireClair };
    case 'Sécurité':
      return { icone: 'shield-checkmark-outline', couleur: turq, fond: turqFond };
    case 'Réservation':
      return { icone: 'calendar-outline', couleur: couleurs.primaire, fond: couleurs.primaireClair };
    default:
      return { icone: 'notifications-outline', couleur: couleurs.primaire, fond: couleurs.primaireClair };
  }
}

// Où mène la notification, selon le rôle ; null s'il n'y a rien à ouvrir
export function destinationNotification(n, role) {
  const idCible = n.idCible;
  if (n.typeCible === 'RESERVATION' && idCible) {
    if (role === 'CLIENT') return { libelle: 'Voir ma réservation', ecran: 'ReservationDetail', params: { idReservation: idCible } };
    if (role === 'COMMERCANT') return { libelle: 'Voir la demande', ecran: 'ReservationCommercantDetail', params: { idReservation: idCible } };
  }
  if (n.typeCible === 'BOUTIQUE') {
    if (role === 'ADMIN' && idCible) return { libelle: 'Voir la boutique', ecran: 'BoutiqueAdminDetail', params: { idBoutique: idCible } };
    if (role === 'COMMERCANT') return { libelle: 'Voir ma boutique', ecran: 'MaBoutique' };
  }
  if (n.typeCible === 'PRODUIT_SERVICE' && role === 'COMMERCANT') return { libelle: 'Voir le catalogue', ecran: 'Catalogue' };

  // Sans élément précis : on ouvre la section qui correspond au genre de notification
  const genre = libelleType(n.typeNotification);
  if (genre === 'Paiement') {
    if (role === 'CLIENT') return { libelle: 'Voir mes paiements', ecran: 'Paiements' };
    if (role === 'COMMERCANT') return { libelle: 'Voir le tableau de bord', ecran: 'Tableau' };
  }
  if (genre === 'Avis' && role === 'COMMERCANT') return { libelle: 'Voir les avis', ecran: 'Avis' };
  if (genre === 'Message' && role === 'ADMIN') return { libelle: 'Voir les messages', ecran: 'Messages' };
  if (genre === 'Sécurité') return { libelle: 'Modifier mon profil', ecran: 'ModifierProfil' };
  if (genre === 'Réservation') {
    if (role === 'CLIENT') return { libelle: 'Voir mes réservations', ecran: 'Reservations' };
    if (role === 'COMMERCANT') return { libelle: 'Voir les réservations', ecran: 'Reservations' };
  }
  return null;
}