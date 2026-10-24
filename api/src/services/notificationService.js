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