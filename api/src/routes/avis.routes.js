const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier, autoriser } = require('../middlewares/auth');
const { creerAvisSchema, modifierAvisSchema } = require('../validators/avis.validator');
const avis = require('../controllers/avisController');

router.use(authentifier, autoriser('CLIENT'));

router.post('/', validate(creerAvisSchema), avis.creer);
router.put('/:id', validate(modifierAvisSchema), avis.modifier);

module.exports = router;