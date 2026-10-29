const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier } = require('../middlewares/auth');
const { inscriptionSchema, connexionSchema } = require('../validators/utilisateur.validator');
const { inscription, connexion, moi } = require('../controllers/utilisateurController');
const { modifierProfilSchema, changerMotDePasseSchema } = require('../validators/profil.validator');
const { modifierProfil, changerMotDePasse } = require('../controllers/profilController');

router.post('/inscription', validate(inscriptionSchema), inscription);
router.post('/connexion', validate(connexionSchema), connexion);
router.get('/moi', authentifier, moi);
// Modifier son profil et son mot de passe (tous les rôles connectés)
router.patch('/moi', authentifier, validate(modifierProfilSchema), modifierProfil);
router.put('/mot-de-passe', authentifier, validate(changerMotDePasseSchema), changerMotDePasse);

module.exports = router;