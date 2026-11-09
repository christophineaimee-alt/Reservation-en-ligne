// Envoi d'e-mails avec Nodemailer (Gmail + mot de passe d'application)
// Sans MAIL_UTILISATEUR dans .env, le code s'affiche seulement dans la console de l'API (mode test)
let transporteur = null;

function obtenirTransporteur() {
  if (transporteur) return transporteur;
  const nodemailer = require('nodemailer');
  transporteur = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.MAIL_UTILISATEUR, pass: process.env.MAIL_MOT_DE_PASSE },
  });
  return transporteur;
}

const TEXTES = {
  verification: {
    sujet: 'Votre code de vérification',
    intro: 'Voici votre code de vérification :',
    pied: "Si vous n'avez pas créé de compte, ignorez ce message.",
  },
  reset: {
    sujet: 'Réinitialisation de votre mot de passe',
    intro: 'Voici votre code pour réinitialiser votre mot de passe :',
    pied: "Si vous n'avez pas demandé cette réinitialisation, ignorez ce message : votre mot de passe reste inchangé.",
  },
};

async function envoyerCodeVerification({ email, prenom, code, dureeMinutes, objet = 'verification' }) {
  if (!process.env.MAIL_UTILISATEUR || !process.env.MAIL_MOT_DE_PASSE) {
    console.log(`[MAIL TEST] Code (${objet}) pour ${email} : ${code}`);
    return;
  }
  const t = TEXTES[objet] || TEXTES.verification;
  await obtenirTransporteur().sendMail({
    from: `"Marketplace" <${process.env.MAIL_UTILISATEUR}>`,
    to: email,
    subject: t.sujet,
    text: `Bonjour ${prenom},\n\n${t.intro} ${code}\nIl est valable ${dureeMinutes} minutes.\n\n${t.pied}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto">
      <h2>Bonjour ${prenom},</h2>
      <p>${t.intro}</p>
      <p style="font-size:34px;font-weight:700;letter-spacing:8px;background:#f3e8ff;color:#6b12b0;padding:14px;text-align:center;border-radius:12px">${code}</p>
      <p>Il est valable ${dureeMinutes} minutes.</p>
      <p style="color:#777;font-size:12px">${t.pied}</p></div>`,
  });
}

module.exports = { envoyerCodeVerification };