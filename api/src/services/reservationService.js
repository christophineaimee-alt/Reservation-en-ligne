const prisma = require('../config/prisma');
const { notifier } = require('./notificationService');

const ACTIVES = ['EN_ATTENTE', 'ACCEPTEE'];
const HEURE_MS = 60 * 60 * 1000;
// RG2 et RG3 : modifiables dans le .env (facultatif)
const DELAI_EXPIRATION_HEURES = Number(process.env.DELAI_EXPIRATION_HEURES) || 24;
const DELAI_ANNULATION_HEURES = Number(process.env.DELAI_ANNULATION_HEURES) || 2;

const selectProduit = {
  idProduitService: true,
  nom: true,
  type: true,
  prix: true,
  actif: true,
  boutique: { select: { idBoutique: true, nom: true, ville: true } },
};
const selectCreneau = { idDisponibilite: true, date: true, heureDebut: true, heureFin: true, bloque: true };
const selectPaiement = {
  idPaiement: true,
  statut: true,
  operateur: true,
  montant: true,
  datePaiement: true,
  messageErreur: true,
};

const inclureClient = {
  produitService: { select: selectProduit },
  disponibilite: { select: selectCreneau },
  // Dernier paiement seulement : un paiement réussi bloque tout nouvel essai
  paiements: { select: selectPaiement, orderBy: { createdAt: 'desc' }, take: 1 },
  avis: { select: { idAvis: true, note: true, commentaire: true, reponse: true } },
  promotion: { select: { titre: true } },
};
const inclureCommercant = {
  ...inclureClient,
  client: {
    select: {
      idClient: true,
      utilisateur: { select: { idUser: true, nom: true, prenom: true, telephone: true } },
    },
  },
};

function formater(r) {
  return {
    idReservation: r.idReservation,
    statut: r.statut,
    quantite: r.quantite,
    remarque: r.remarque,
    dateHeure: r.dateHeure,
    motifRefus: r.motifRefus,
    dateExpiration: r.dateExpiration,
    createdAt: r.createdAt,
    montantTotal:
      r.montantTotal !== null && r.montantTotal !== undefined
        ? Number(r.montantTotal)
        : r.produitService
          ? Number(r.produitService.prix) * r.quantite
          : null,
    paye: r.paiements && r.paiements.length > 0 ? r.paiements[0].statut === 'REUSSI' : false,
    avis: r.avis || null,
    montantInitial: r.montantInitial !== null && r.montantInitial !== undefined ? Number(r.montantInitial) : null,
    remise: r.remise !== null && r.remise !== undefined ? Number(r.remise) : 0,
    promotionTitre: r.promotion ? r.promotion.titre : null,
    paiement:
      r.paiements && r.paiements.length > 0
        ? {
            idPaiement: r.paiements[0].idPaiement,
            statut: r.paiements[0].statut,
            operateur: r.paiements[0].operateur,
            montant: Number(r.paiements[0].montant),
            datePaiement: r.paiements[0].datePaiement,
            messageErreur: r.paiements[0].messageErreur,
          }
        : null,
    produitService: r.produitService
      ? {
          idProduitService: r.produitService.idProduitService,
          nom: r.produitService.nom,
          type: r.produitService.type,
          prix: Number(r.produitService.prix),
          boutique: r.produitService.boutique,
        }
      : undefined,
    creneau: r.disponibilite
      ? {
          date: r.disponibilite.date.toISOString().slice(0, 10),
          heureDebut: r.disponibilite.heureDebut,
          heureFin: r.disponibilite.heureFin,
        }
      : null,
    client: r.client
      ? {
          idClient: r.client.idClient,
          nom: r.client.utilisateur.nom,
          prenom: r.client.utilisateur.prenom,
          telephone: r.client.utilisateur.telephone,
        }
      : undefined,
  };
}

// Madagascar : UTC+3, sans heure d'été
function heureEnDate(dateTexte, heure) {
  return new Date(`${dateTexte}T${heure}:00+03:00`);
}

function dateHeureCreneau(creneau) {
  return heureEnDate(creneau.date.toISOString().slice(0, 10), creneau.heureDebut);
}

// RG2 : la demande expire après le délai, ou à l'heure du rendez-vous si elle est plus proche
function calculerExpiration(dateHeure) {
  const limite = new Date(Date.now() + DELAI_EXPIRATION_HEURES * HEURE_MS);
  return dateHeure < limite ? dateHeure : limite;
}

// RG4 : bloquer le stock (retourne false si la quantité n'est pas disponible)
async function bloquerStock(tx, idProduitService, quantite) {
  const r = await tx.stock.updateMany({
    where: { idProduitService, quantite: { gte: quantite } },
    data: { quantite: { decrement: quantite } },
  });
  return r.count === 1;
}

// RG4 : libérer le stock
async function libererStock(tx, idProduitService, quantite) {
  await tx.stock.updateMany({
    where: { idProduitService },
    data: { quantite: { increment: quantite } },
  });
}

// Empêche deux clients de prendre la dernière place en même temps
async function verrouillerCreneau(tx, idDisponibilite) {
  await tx.$queryRaw`SELECT "idDisponibilite" FROM "Disponibilite" WHERE "idDisponibilite" = ${idDisponibilite} FOR UPDATE`;
}

async function placesRestantes(tx, creneau) {
  const pris = await tx.reservation.count({
    where: { idDisponibilite: creneau.idDisponibilite, statut: { in: ACTIVES } },
  });
  return creneau.capacite - pris;
}

async function idUserDuCommercant(idBoutique) {
  const boutique = await prisma.boutique.findUnique({
    where: { idBoutique },
    select: { commercant: { select: { idUser: true } } },
  });
  return boutique ? boutique.commercant.idUser : null;
}

async function alerterStockSiFaible(idProduitService, idUserCommercant) {
  const stock = await prisma.stock.findUnique({
    where: { idProduitService },
    include: { produitService: { select: { nom: true } } },
  });
  if (!stock) return;
  const nom = stock.produitService.nom;
  const cible = { type: 'PRODUIT_SERVICE', id: idProduitService };
  if (stock.quantite === 0) {
    await notifier(idUserCommercant, 'STOCK_FAIBLE', 'Rupture de stock', `Le produit « ${nom} » est en rupture de stock.`, cible);
  } else if (stock.seuilAlerte > 0 && stock.quantite <= stock.seuilAlerte) {
    await notifier(idUserCommercant, 'STOCK_FAIBLE', 'Stock faible', `Le stock du produit « ${nom} » est faible (${stock.quantite} restant).`, cible);
  }
}

// RG2 : marque comme expirées les demandes sans réponse (appelée par le planificateur)
async function expirerReservations() {
  const echues = await prisma.reservation.findMany({
    where: { statut: 'EN_ATTENTE', dateExpiration: { lt: new Date() } },
    include: {
      client: { select: { idUser: true } },
      produitService: {
        select: { nom: true, type: true, boutique: { select: { commercant: { select: { idUser: true } } } } },
      },
    },
  });

  let total = 0;
  for (const r of echues) {
    const expiree = await prisma.$transaction(async (tx) => {
      const maj = await tx.reservation.updateMany({
        where: { idReservation: r.idReservation, statut: 'EN_ATTENTE' },
        data: { statut: 'EXPIREE' },
      });
      if (maj.count === 0) return false;
      if (r.produitService.type === 'PRODUIT') await libererStock(tx, r.idProduitService, r.quantite);
      return true;
    });
    if (!expiree) continue;
    total += 1;
    await notifier(
      r.client.idUser,
      'RESERVATION_EXPIREE',
      'Réservation expirée',
      `Votre demande pour « ${r.produitService.nom} » a expiré sans réponse du commerçant.`,
      { type: 'RESERVATION', id: r.idReservation }
    );
    
    await notifier(
      r.produitService.boutique.commercant.idUser,
      'RESERVATION_EXPIREE',
      'Demande expirée',
      `Une demande pour « ${r.produitService.nom} » a expiré sans réponse.`,
      { type: 'RESERVATION', id: r.idReservation }
    );
    
  }
  return total;
}

module.exports = {
  ACTIVES,
  HEURE_MS,
  DELAI_EXPIRATION_HEURES,
  DELAI_ANNULATION_HEURES,
  inclureClient,
  inclureCommercant,
  formater,
  heureEnDate,
  dateHeureCreneau,
  calculerExpiration,
  bloquerStock,
  libererStock,
  verrouillerCreneau,
  placesRestantes,
  idUserDuCommercant,
  alerterStockSiFaible,
  expirerReservations,
};