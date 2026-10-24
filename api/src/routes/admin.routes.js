const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier, autoriser } = require('../middlewares/auth');
const { decisionSchema } = require('../validators/boutique.validator');
const { actionUtilisateurSchema } = require('../validators/utilisateurAdmin.validator');
const { listerAdmin, detailAdmin, decider } = require('../controllers/boutiqueController');
const utilisateurs = require('../controllers/utilisateurAdminController');

router.use(authentifier, autoriser('ADMIN'));

// UC23 : valider les boutiques
router.get('/boutiques', listerAdmin);
router.get('/boutiques/:id', detailAdmin);
router.patch('/boutiques/:id/validation', validate(decisionSchema), decider);

// UC22 : gérer les utilisateurs
router.get('/utilisateurs', utilisateurs.lister);
router.get('/utilisateurs/:id', utilisateurs.detail);
router.patch('/utilisateurs/:id/action', validate(actionUtilisateurSchema), utilisateurs.agir);

module.exports = router;