const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const parseId = require('../utils/parseId');
const bcrypt = require('bcryptjs');
const { notifier, notifierAdmins } = require('../services/notificationService');

const ROLES = ['ADMIN', 'CLIENT', 'COMMERCANT'];
const STATUTS = ['ACTIF', 'SUSPENDU', 'BLOQUE'];
const ACTIVES = ['EN_ATTENTE', 'ACCEPTEE'];

const choixUtilisateur = {
  idUser: true,
  email: true,
  telephone: true,
  nom: true,
  prenom: true,
  role: true,
  statutCompte: true,
  nbEchecs: true,
  createdAt: true,
};

// UC22 : liste des comptes (filtres : q, role, statutCompte)
const lister = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 50);
  const { q, role, statutCompte } = req.query;

  const where = {};
  if (role) {
    if (!ROLES.includes(role)) throw new AppError('Rôle invalide', 400);
    where.role = role;
  }
  if (statutCompte) {
    if (!STATUTS.includes(statutCompte)) throw new AppError('Statut invalide', 400);
    where.statutCompte = statutCompte;
  }
  if (q) {
    const mot = String(q);
    where.OR = [
      { nom: { contains: mot, mode: 'insensitive' } },
      { prenom: { contains: mot, mode: 'insensitive' } },
      { email: { contains: mot, mode: 'insensitive' } },
      { telephone: { contains: mot } },
    ];
  }

  const [total, utilisateurs] = await Promise.all([
    prisma.utilisateur.count({ where }),
    prisma.utilisateur.findMany({
      where,
      select: choixUtilisateur,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
  ]);
  res.json({ total, page, limite, utilisateurs });
});

// UC22 : détail d'un compte
const detail = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const utilisateur = await prisma.utilisateur.findUnique({ where: { idUser: id }, select: choixUtilisateur });
  if (!utilisateur) throw new AppError('Utilisateur introuvable', 404);
  res.json({ utilisateur });
});

async function compterReservations(cible) {
  let where = null;
  if (cible.client) where = { idClient: cible.client.idClient };
  else if (cible.commercant && cible.commercant.boutique) {
    where = { produitService: { idBoutique: cible.commercant.boutique.idBoutique } };
  }
  if (!where) return { enCours: 0, total: 0 };
  const [enCours, total] = await Promise.all([
    prisma.reservation.count({ where: { ...where, statut: { in: ACTIVES } } }),
    prisma.reservation.count({ where }),
  ]);
  return { enCours, total };
}

// UC22 : suspendre, réactiver ou supprimer un compte
const agir = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { action } = req.body;

  // Alternatif 3a : un administrateur ne peut pas agir sur son propre compte
  if (id === req.utilisateur.idUser) {
    throw new AppError('Action refusée : vous ne pouvez pas agir sur votre propre compte', 403);
  }

  const cible = await prisma.utilisateur.findUnique({
    where: { idUser: id },
    include: { client: true, commercant: { include: { boutique: true } } },
  });
  if (!cible) throw new AppError('Utilisateur introuvable', 404);

  if (action === 'SUSPENDRE') {
    if (cible.statutCompte === 'SUSPENDU') throw new AppError('Ce compte est déjà suspendu', 409);
    await prisma.utilisateur.update({ where: { idUser: id }, data: { statutCompte: 'SUSPENDU' } });
    await notifier(id, 'COMPTE_SUSPENDU', 'Compte suspendu', "Votre compte a été suspendu par l'administrateur.");
    return res.json({ message: 'Compte suspendu', idUser: id, statutCompte: 'SUSPENDU' });
  }

  if (action === 'REACTIVER') {
    await prisma.utilisateur.update({ where: { idUser: id }, data: { statutCompte: 'ACTIF', nbEchecs: 0 } });
    await notifier(id, 'COMPTE_REACTIVE', 'Compte réactivé', 'Votre compte est de nouveau actif.');
    return res.json({ message: 'Compte réactivé', idUser: id, statutCompte: 'ACTIF' });
  }

  // SUPPRIMER
  if (cible.role === 'ADMIN') {
    throw new AppError('Un compte administrateur ne peut pas être supprimé ici', 403);
  }
  const { enCours, total } = await compterReservations(cible);
  if (enCours > 0) {
    throw new AppError(
      `Suppression refusée : ${enCours} réservation(s) en cours. Suspendez plutôt le compte.`,
      409
    );
  }
  if (total > 0) {
    throw new AppError("Suppression impossible : le compte a un historique de réservations à conserver. Suspendez-le plutôt.", 409);
  }

  await prisma.utilisateur.delete({ where: { idUser: id } });
  res.json({ message: 'Compte supprimé', idUser: id });
});

// UC22 : un administrateur crée un autre compte administrateur
const creerAdministrateur = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, motDePasse } = req.body;
  const existant = await prisma.utilisateur.findFirst({
    where: { OR: [{ email }, { telephone }] },
  });
  if (existant) {
    throw new AppError('Un compte existe déjà avec cet e-mail ou ce téléphone', 409);
  }
  const hash = await bcrypt.hash(motDePasse, 10);
  const cree = await prisma.utilisateur.create({
    data: { nom, prenom, email, telephone, motDePasse: hash, role: 'ADMIN', admin: { create: {} } },
    select: choixUtilisateur,
  });
  await notifierAdmins(
    'ADMIN_AJOUTE',
    'Nouvel administrateur',
    `${req.utilisateur.prenom} ${req.utilisateur.nom} a ajouté ${prenom} ${nom} (${email}) comme administrateur.`
  );
  res.status(201).json({ message: 'Administrateur créé', utilisateur: cree });
});

module.exports = { lister, detail, agir, creerAdministrateur };