const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');

// Messages reçus via le formulaire de contact (?lu=true ou ?lu=false pour filtrer)
const lister = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 50);
  const where = {};
  if (req.query.lu === 'true') where.lu = true;
  if (req.query.lu === 'false') where.lu = false;

  const [messages, total, nonLus] = await Promise.all([
    prisma.messageContact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
    prisma.messageContact.count({ where }),
    prisma.messageContact.count({ where: { lu: false } }),
  ]);
  res.json({ total, nonLus, page, limite, messages });
});

const marquerLu = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const existant = await prisma.messageContact.findUnique({ where: { idMessage: id } });
  if (!existant) throw new AppError('Message introuvable', 404);
  const message = await prisma.messageContact.update({ where: { idMessage: id }, data: { lu: true } });
  res.json({ message: 'Message marqué comme lu', contact: message });
});

module.exports = { lister, marquerLu };