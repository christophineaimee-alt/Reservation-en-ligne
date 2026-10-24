const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier, autoriser } = require('../middlewares/auth');
const { creerCategorieSchema, modifierCategorieSchema } = require('../validators/categorie.validator');
const { lister, listerTous, creer, modifier } = require('../controllers/categorieController');

router.get('/', lister);
router.get('/tous', authentifier, autoriser('ADMIN'), listerTous);
router.post('/', authentifier, autoriser('ADMIN'), validate(creerCategorieSchema), creer);
router.put('/:id', authentifier, autoriser('ADMIN'), validate(modifierCategorieSchema), modifier);

module.exports = router;