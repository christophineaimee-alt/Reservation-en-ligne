const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { envoyerCodeVerification } = require('./mailService');

const DUREE_MINUTES = 10;
const PAUSE_SECONDES = 60;
const MAX_ESSAIS = 5;

// objet : 'verification' (inscription) ou 'reset' (mot de passe oublié) ; un code ne sert qu'à son objet
function hacher(idUser, code, objet) {
  return crypto.createHash('sha256').update(`${objet}:${idUser}:${code}:${process.env.JWT_SECRET || ''}`).digest('hex');
}

// Génère un code à 6 chiffres, l'enregistre (haché) et l'envoie par e-mail
// Retourne { envoye } : false si l'e-mail n'a pas pu partir
async function envoyerCode(utilisateur, objet = 'verification') {
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await prisma.utilisateur.update({
    where: { idUser: utilisateur.idUser },
    data: {
      codeHash: hacher(utilisateur.idUser, code, objet),
      codeExpire: new Date(Date.now() + DUREE_MINUTES * 60 * 1000),
      codeEssais: 0,
      codeEnvoyeLe: new Date(),
    },
  });
  try {
    await envoyerCodeVerification({ email: utilisateur.email, prenom: utilisateur.prenom, code, dureeMinutes: DUREE_MINUTES, objet });
    return { envoye: true };
  } catch (e) {
    console.error('Échec envoi e-mail :', e.message);
    return { envoye: false };
  }
}

function secondesRestantes(u) {
  if (!u.codeEnvoyeLe) return 0;
  const reste = PAUSE_SECONDES * 1000 - (Date.now() - u.codeEnvoyeLe.getTime());
  return reste > 0 ? Math.ceil(reste / 1000) : 0;
}

// Contrôle le code saisi (sans rien modifier si le code est bon) ; lève une erreur sinon
async function controlerCode(u, code, objet) {
  if (!u.codeHash || !u.codeExpire || u.codeExpire < new Date()) {
    throw new AppError('Code expiré. Demandez un nouveau code.', 400);
  }
  if (u.codeEssais >= MAX_ESSAIS) {
    throw new AppError("Trop d'essais. Demandez un nouveau code.", 429);
  }
  const attendu = Buffer.from(u.codeHash, 'hex');
  const recu = Buffer.from(hacher(u.idUser, code, objet), 'hex');
  if (attendu.length !== recu.length || !crypto.timingSafeEqual(attendu, recu)) {
    await prisma.utilisateur.update({ where: { idUser: u.idUser }, data: { codeEssais: { increment: 1 } } });
    throw new AppError('Code incorrect', 400);
  }
}

// ---------- Vérification de l'e-mail à l'inscription ----------

async function renvoyerCode(email) {
  const u = await prisma.utilisateur.findUnique({ where: { email } });
  // Réponse identique si le compte n'existe pas ou est déjà vérifié (on ne révèle rien)
  if (!u || u.emailVerifie) return;
  const reste = secondesRestantes(u);
  if (reste > 0) throw new AppError(`Patientez ${reste} secondes avant de redemander un code`, 429);
  const r = await envoyerCode(u, 'verification');
  if (!r.envoye) throw new AppError("Impossible d'envoyer l'e-mail pour le moment. Réessayez plus tard.", 502);
}

async function verifierCode(email, code) {
  const u = await prisma.utilisateur.findUnique({ where: { email } });
  if (!u) throw new AppError('Code incorrect ou expiré', 400);
  if (u.emailVerifie) throw new AppError('Cet e-mail est déjà vérifié. Connectez-vous.', 400);
  await controlerCode(u, code, 'verification');
  await prisma.utilisateur.update({
    where: { idUser: u.idUser },
    data: { emailVerifie: true, codeHash: null, codeExpire: null, codeEssais: 0 },
  });
}

// ---------- Mot de passe oublié ----------

// Envoie un code de réinitialisation. Réponse toujours identique, que le compte existe ou non
async function demanderReinitialisation(email) {
  const u = await prisma.utilisateur.findUnique({ where: { email } });
  if (!u) return;
  if (secondesRestantes(u) > 0) return; // pause entre deux envois : on ne renvoie rien, sans le dire
  await envoyerCode(u, 'reset');
}

// Vérifie le code puis enregistre le nouveau mot de passe
async function reinitialiserMotDePasse(email, code, nouveauMotDePasse) {
  const u = await prisma.utilisateur.findUnique({ where: { email } });
  if (!u) throw new AppError('Code incorrect ou expiré', 400);
  await controlerCode(u, code, 'reset');
  const hash = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.utilisateur.update({
    where: { idUser: u.idUser },
    data: {
      motDePasse: hash,
      nbEchecs: 0,
      emailVerifie: true, // le code reçu par e-mail prouve que l'adresse est bien la sienne
      codeHash: null,
      codeExpire: null,
      codeEssais: 0,
    },
  });
}

module.exports = { envoyerCode, renvoyerCode, verifierCode, demanderReinitialisation, reinitialiserMotDePasse };