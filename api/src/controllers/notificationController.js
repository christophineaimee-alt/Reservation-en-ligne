const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');

// UC10 et UC21 : mes notifications
const lister = asyncHandler(async (req, res) => {
  const idUser = req.utilisateur.idUser;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 50);

  const where = { idUser };
  if (req.query.lue !== undefined) {
    if (!['true', 'false'].includes(req.query.lue)) throw new AppError('Paramètre "lue" invalide (true ou false)', 400);
    where.lue = req.query.lue === 'true';
  }

  const [total, nonLues, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { idUser, lue: false } }),
    prisma.notification.findMany({
      where,
      orderBy: { dateEnvoi: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
  ]);

  res.json({
    total,
    nonLues,
    page,
    limite,
    message: total === 0 ? 'Aucune notification' : undefined,
    notifications,
  });
});

// Messages 7 à 11 : ouvrir une notification la marque comme lue
const ouvrir = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const notification = await prisma.notification.findFirst({
    where: { idNotification: id, idUser: req.utilisateur.idUser },
  });
  if (!notification) throw new AppError('Notification introuvable', 404);

  const maj = notification.lue
    ? notification
    : await prisma.notification.update({ where: { idNotification: id }, data: { lue: true } });
  res.json({ notification: maj });
});

// Tout marquer comme lu
const toutLire = asyncHandler(async (req, res) => {
  const r = await prisma.notification.updateMany({
    where: { idUser: req.utilisateur.idUser, lue: false },
    data: { lue: true },
  });
  res.json({ message: `${r.count} notification(s) marquée(s) comme lue(s)`, total: r.count });
});

module.exports = { lister, ouvrir, toutLire };