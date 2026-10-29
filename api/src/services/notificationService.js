/*
const prisma = require('../config/prisma');

async function notifier(idUser, typeNotification, titre, message) {
  return prisma.notification.create({ data: { idUser, typeNotification, titre, message } });
}

async function notifierAdmins(typeNotification, titre, message) {
  const admins = await prisma.utilisateur.findMany({
    where: { role: 'ADMIN', statutCompte: 'ACTIF' },
    select: { idUser: true },
  });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((a) => ({ idUser: a.idUser, typeNotification, titre, message })),
  });
}

module.exports = { notifier, notifierAdmins };
*/

const prisma = require('../config/prisma');

// cible (facultative) : { type, id } décrit l'élément à ouvrir quand on touche la notification
// Types utilisés : RESERVATION, BOUTIQUE, PRODUIT_SERVICE
function champsCible(cible) {
  return cible ? { typeCible: cible.type, idCible: cible.id } : {};
}

async function notifier(idUser, typeNotification, titre, message, cible = null) {
  return prisma.notification.create({
    data: { idUser, typeNotification, titre, message, ...champsCible(cible) },
  });
}

async function notifierAdmins(typeNotification, titre, message, cible = null) {
  const admins = await prisma.utilisateur.findMany({
    where: { role: 'ADMIN', statutCompte: 'ACTIF' },
    select: { idUser: true },
  });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((a) => ({ idUser: a.idUser, typeNotification, titre, message, ...champsCible(cible) })),
  });
}

module.exports = { notifier, notifierAdmins };