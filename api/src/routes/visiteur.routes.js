const router = require('express').Router();
const validate = require('../middlewares/validate');
const { contactSchema } = require('../validators/visiteur.validator');
const visiteur = require('../controllers/visiteurController');

// Routes publiques : aucun compte nécessaire
router.get('/accueil', visiteur.accueil);
router.get('/categories', visiteur.categories);
router.get('/boutiques/:id', visiteur.fiche);
router.post('/contact', validate(contactSchema), visiteur.contact);

module.exports = router;