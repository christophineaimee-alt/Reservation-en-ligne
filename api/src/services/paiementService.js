const prisma = require('../config/prisma');
const env = require('../config/env');
const { notifier } = require('./notificationService');
const { choisir } = require('./paiement');
const { masquer, LIBELLES } = require('../utils/telephone');

const MINUTE_MS = 60 * 1000;

// Montant mémorisé à la demande ; sinon prix actuel × quantité (anciennes réservations)
function montantReservation(reservation) {
  if (reservation.montantTotal !== null && reservation.montantTotal !== undefined) {
    return Number(reservation.montantTotal);
  }
  return Number(reservation.produitService.prix) * reservation.quantite;
}

function formaterPaiement(p) {
  return {
    idPaiement: p.idPaiement,
    idReservation: p.idReservation,
    montant: Number(p.montant),
    devise: p.devise,
    operateur: p.operateur,
    operateurLibelle: LIBELLES[p.operateur] || p.operateur,
    telephone: masquer(p.telephonePayeur),
    statut: p.statut,
    messageErreur: p.messageErreur,
    datePaiement: p.datePaiement,
    createdAt: p.createdAt,
  };
}

function formaterMontant(valeur) {
  return `${Math.round(Number(valeur)).toLocaleString('fr-FR')} Ar`;
}

// Interroge l'opérateur et met à jour un paiement encore « en attente »
async function actualiserStatut(paiement) {
  if (paiement.statut !== 'EN_ATTENTE') return paiement;

  const fournisseur = choisir(paiement.operateur);
  let resultat;
  try {
    resultat = await fournisseur.verifier(paiement);
  } catch (e) {
    resultat = { statut: 'EN_ATTENTE' }; // erreur réseau : on réessaiera
  }

  const ecoule = Date.now() - new Date(paiement.createdAt).getTime();
  if (resultat.statut === 'EN_ATTENTE' && ecoule > env.delaiPaiementMinutes * MINUTE_MS) {
    resultat = { statut: 'EXPIRE', messageErreur: 'Délai de confirmation dépassé' };
  }
  if (resultat.statut === 'EN_ATTENTE') return paiement;

  // Un seul appel peut faire passer le paiement de « en attente » à son état final
  const maj = await prisma.paiement.updateMany({
    where: { idPaiement: paiement.idPaiement, statut: 'EN_ATTENTE' },
    data: {
      statut: resultat.statut,
      messageErreur: resultat.messageErreur || null,
      datePaiement: resultat.statut === 'REUSSI' ? new Date() : null,
    },
  });

  const final = await prisma.paiement.findUnique({ where: { idPaiement: paiement.idPaiement } });
  if (maj.count === 0) return final;

  const reservation = await prisma.reservation.findUnique({
    where: { idReservation: paiement.idReservation },
    include: {
      client: { select: { idUser: true } },
      produitService: {
        select: { nom: true, boutique: { select: { commercant: { select: { idUser: true } } } } },
      },
    },
  });

  const nom = reservation.produitService.nom;
  const idClient = reservation.client.idUser;
  const idCommercant = reservation.produitService.boutique.commercant.idUser;
  const cible = { type: 'RESERVATION', id: paiement.idReservation };
  
  if (final.statut === 'REUSSI') {
    await notifier(idClient, 'PAIEMENT_REUSSI', 'Paiement confirmé',
      `Votre paiement de ${formaterMontant(final.montant)} pour « ${nom} » est confirmé.`, cible);
    await notifier(idCommercant, 'PAIEMENT_RECU', 'Paiement reçu',
      `Paiement de ${formaterMontant(final.montant)} reçu pour « ${nom} ».`, cible);
  } else if (final.statut === 'ECHOUE') {
    await notifier(idClient, 'PAIEMENT_ECHOUE', 'Paiement échoué',
      `Le paiement pour « ${nom} » a échoué : ${final.messageErreur || 'refusé'}. Vous pouvez réessayer.`, cible);
  } else {
    await notifier(idClient, 'PAIEMENT_EXPIRE', 'Paiement expiré',
      `Le paiement pour « ${nom} » n'a pas été confirmé à temps. Vous pouvez réessayer.`, cible);
  }
  return final;
}
  

module.exports = { montantReservation, formaterPaiement, formaterMontant, actualiserStatut };