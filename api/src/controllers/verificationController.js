const asyncHandler = require('../utils/asyncHandler');
const {
  renvoyerCode,
  verifierCode,
  demanderReinitialisation,
  reinitialiserMotDePasse,
} = require('../services/codeVerificationService');

// POST /auth/verifier-code { email, code }
const verifier = asyncHandler(async (req, res) => {
  await verifierCode(req.body.email, req.body.code);
  res.json({ message: 'E-mail vérifié. Vous pouvez vous connecter.' });
});

// POST /auth/renvoyer-code { email }
const renvoyer = asyncHandler(async (req, res) => {
  await renvoyerCode(req.body.email);
  res.json({ message: "Si ce compte existe, un nouveau code vient d'être envoyé." });
});

// POST /auth/mot-de-passe-oublie { email }
const motDePasseOublie = asyncHandler(async (req, res) => {
  await demanderReinitialisation(req.body.email);
  res.json({ message: 'Si un compte existe avec cet e-mail, un code vient de lui être envoyé.' });
});

// POST /auth/reinitialiser-mot-de-passe { email, code, motDePasse }
const reinitialiser = asyncHandler(async (req, res) => {
  await reinitialiserMotDePasse(req.body.email, req.body.code, req.body.motDePasse);
  res.json({ message: 'Mot de passe modifié. Vous pouvez vous connecter.' });
});

module.exports = { verifier, renvoyer, motDePasseOublie, reinitialiser };