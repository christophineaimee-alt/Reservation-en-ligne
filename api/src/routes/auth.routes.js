const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier } = require('../middlewares/auth');
const { inscriptionSchema, connexionSchema } = require('../validators/utilisateur.validator');
const { inscription, connexion, moi } = require('../controllers/utilisateurController');

router.post('/inscription', validate(inscriptionSchema), inscription);
router.post('/connexion', validate(connexionSchema), connexion);
router.get('/moi', authentifier, moi);

module.exports = router;