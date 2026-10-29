const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { notifier } = require('../services/notificationService');
const { normaliserTelephoneMG, variantesTelephone } = require('../utils/telephone');

function publicUser(u) {
  const { motDePasse, nbEchecs, ...reste } = u;
  return reste;
}

// Modifier son nom, son prénom et son numéro de téléphone (tous les rôles)
const modifierProfil = asyncHandler(async (req, res) => {
  const actuel = req.utilisateur;
  const donnees = {};

  if (req.body.prenom !== undefined && req.body.prenom !== actuel.prenom) donnees.prenom = req.body.prenom;
  if (req.body.nom !== undefined && req.body.nom !== actuel.nom) donnees.nom = req.body.nom;

  if (req.body.telephone !== undefined) {
    const numero = normaliserTelephoneMG(req.body.telephone);
    if (!numero) {
      throw new AppError(
        'Numéro invalide : saisissez un numéro malgache de 10 chiffres (032, 033, 034, 037 ou 038), par exemple 034 12 345 67',
        400
      );
    }
    const variantes = variantesTelephone(numero);
    // Même numéro que le sien, écrit autrement : rien à changer
    if (!variantes.includes(actuel.telephone)) {
      const autre = await prisma.utilisateur.findFirst({
        where: { telephone: { in: variantes }, NOT: { idUser: actuel.idUser } },
      });
      if (autre) throw new AppError('Ce numéro est déjà utilisé par un autre compte', 409);
      donnees.telephone = numero;
    }
  }

  if (Object.keys(donnees).length === 0) {
    return res.json({ message: 'Aucune modification', utilisateur: publicUser(actuel) });
  }
  const utilisateur = await prisma.utilisateur.update({ where: { idUser: actuel.idUser }, data: donnees });
  return res.json({ message: 'Profil mis à jour', utilisateur: publicUser(utilisateur) });
});

// Changer son mot de passe (tous les rôles)
const changerMotDePasse = asyncHandler(async (req, res) => {
  const { motDePasseActuel, nouveauMotDePasse } = req.body;
  const utilisateur = await prisma.utilisateur.findUnique({ where: { idUser: req.utilisateur.idUser } });

  const correct = await bcrypt.compare(motDePasseActuel, utilisateur.motDePasse);
  if (!correct) {
    // Comme à la connexion : trop d'essais ratés bloquent le compte
    const echecs = utilisateur.nbEchecs + 1;
    await prisma.utilisateur.update({
      where: { idUser: utilisateur.idUser },
      data: { nbEchecs: echecs, ...(echecs >= env.maxEchecs ? { statutCompte: 'BLOQUE' } : {}) },
    });
    // 400 et non 401 : un 401 déconnecterait l'application
    throw new AppError('Mot de passe actuel incorrect', 400);
  }
  if (await bcrypt.compare(nouveauMotDePasse, utilisateur.motDePasse)) {
    throw new AppError("Le nouveau mot de passe doit être différent de l'ancien", 400);
  }

  const hash = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.utilisateur.update({ where: { idUser: utilisateur.idUser }, data: { motDePasse: hash, nbEchecs: 0 } });
  await notifier(
    utilisateur.idUser,
    'SECURITE',
    'Mot de passe modifié',
    "Votre mot de passe vient d'être modifié. Si ce n'est pas vous, contactez l'administrateur."
  );
  res.json({ message: 'Mot de passe modifié avec succès' });
});

module.exports = { modifierProfil, changerMotDePasse };