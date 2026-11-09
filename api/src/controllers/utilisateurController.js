/*
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function publicUser(u) {
  const { motDePasse, nbEchecs, ...reste } = u;
  return reste;
}

// UC01 : S'inscrire
const inscription = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, motDePasse, role, adresse, nomCommercial } = req.body;

  const existant = await prisma.utilisateur.findFirst({
    where: { OR: [{ email }, { telephone }] },
  });
  if (existant) {
    throw new AppError('Un compte existe déjà avec cet e-mail ou ce téléphone. Connectez-vous.', 409);
  }

  const hash = await bcrypt.hash(motDePasse, 10);
  const data = { nom, prenom, email, telephone, motDePasse: hash, role };
  if (role === 'CLIENT') data.client = { create: { adresse } };
  else data.commercant = { create: { nomCommercial } };

  const utilisateur = await prisma.utilisateur.create({ data });
  res.status(201).json({ message: 'Inscription réussie', utilisateur: publicUser(utilisateur) });
});

// UC02 : S'authentifier
const connexion = asyncHandler(async (req, res) => {
  const { identifiant, motDePasse } = req.body;

  const utilisateur = await prisma.utilisateur.findFirst({
    where: { OR: [{ email: identifiant.toLowerCase() }, { telephone: identifiant }] },
  });
  if (!utilisateur) throw new AppError('Identifiants incorrects', 401);

  const correct = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  if (!correct) {
    const echecs = utilisateur.nbEchecs + 1;
    await prisma.utilisateur.update({
      where: { idUser: utilisateur.idUser },
      data: {
        nbEchecs: echecs,
        ...(echecs >= env.maxEchecs ? { statutCompte: 'BLOQUE' } : {}),
      },
    });
    throw new AppError('Identifiants incorrects', 401);
  }

  if (utilisateur.statutCompte === 'SUSPENDU') throw new AppError('Compte suspendu', 403);
  if (utilisateur.statutCompte === 'BLOQUE') {
    throw new AppError("Compte bloqué après trop de tentatives. Contactez l'administrateur.", 423);
  }

  await prisma.utilisateur.update({ where: { idUser: utilisateur.idUser }, data: { nbEchecs: 0 } });

  const jeton = jwt.sign({ idUser: utilisateur.idUser, role: utilisateur.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiration,
  });
  res.json({ jeton, utilisateur: publicUser(utilisateur) });
});

const moi = asyncHandler(async (req, res) => {
  res.json({ utilisateur: publicUser(req.utilisateur) });
});

module.exports = { inscription, connexion, moi };
*/
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { envoyerCode, renvoyerCode } = require('../services/codeVerificationService');

// Données renvoyées au mobile : jamais le mot de passe ni les champs du code de vérification
function publicUser(u) {
  const { motDePasse, nbEchecs, codeHash, codeExpire, codeEssais, codeEnvoyeLe, ...reste } = u;
  return reste;
}

// UC01 : S'inscrire (le compte doit ensuite être activé avec le code reçu par e-mail)
const inscription = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, motDePasse, role, adresse, nomCommercial } = req.body;

  const existant = await prisma.utilisateur.findFirst({
    where: { OR: [{ email }, { telephone }] },
  });
  if (existant) {
    throw new AppError('Un compte existe déjà avec cet e-mail ou ce téléphone. Connectez-vous.', 409);
  }

  const hash = await bcrypt.hash(motDePasse, 10);
  const data = { nom, prenom, email, telephone, motDePasse: hash, role, emailVerifie: false };
  if (role === 'CLIENT') data.client = { create: { adresse } };
  else data.commercant = { create: { nomCommercial } };

  const utilisateur = await prisma.utilisateur.create({ data });
  const { envoye } = await envoyerCode(utilisateur);
  res.status(201).json({
    message: 'Inscription réussie. Un code de vérification a été envoyé par e-mail.',
    verificationRequise: true,
    envoye,
    utilisateur: publicUser(utilisateur),
  });
});

// UC02 : S'authentifier
const connexion = asyncHandler(async (req, res) => {
  const { identifiant, motDePasse } = req.body;

  const utilisateur = await prisma.utilisateur.findFirst({
    where: { OR: [{ email: identifiant.toLowerCase() }, { telephone: identifiant }] },
  });
  if (!utilisateur) throw new AppError('Identifiants incorrects', 401);

  const correct = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  if (!correct) {
    const echecs = utilisateur.nbEchecs + 1;
    await prisma.utilisateur.update({
      where: { idUser: utilisateur.idUser },
      data: {
        nbEchecs: echecs,
        ...(echecs >= env.maxEchecs ? { statutCompte: 'BLOQUE' } : {}),
      },
    });
    throw new AppError('Identifiants incorrects', 401);
  }

  if (utilisateur.statutCompte === 'SUSPENDU') throw new AppError('Compte suspendu', 403);
  if (utilisateur.statutCompte === 'BLOQUE') {
    throw new AppError("Compte bloqué après trop de tentatives. Contactez l'administrateur.", 423);
  }

  // E-mail pas encore vérifié : on renvoie un code (sauf si un a été envoyé il y a moins d'une minute)
  // et le mobile ouvre l'écran de saisie du code
  if (!utilisateur.emailVerifie) {
    try {
      await renvoyerCode(utilisateur.email);
    } catch (e) {
      // pause entre deux envois ou échec d'envoi : le client pourra redemander un code sur l'écran suivant
    }
    return res.status(403).json({
      message: 'Vérifiez votre e-mail pour activer votre compte.',
      verificationRequise: true,
      email: utilisateur.email,
    });
  }

  await prisma.utilisateur.update({ where: { idUser: utilisateur.idUser }, data: { nbEchecs: 0 } });

  const jeton = jwt.sign({ idUser: utilisateur.idUser, role: utilisateur.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiration,
  });
  res.json({ jeton, utilisateur: publicUser(utilisateur) });
});

const moi = asyncHandler(async (req, res) => {
  res.json({ utilisateur: publicUser(req.utilisateur) });
});

module.exports = { inscription, connexion, moi };