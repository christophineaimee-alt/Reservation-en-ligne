const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier, autoriser } = require('../middlewares/auth');
const { creerBoutiqueSchema, modifierBoutiqueSchema } = require('../validators/boutique.validator');
const { rechercher, detail, creer, moi, modifierMoi } = require('../controllers/boutiqueController');
const { listerBoutique } = require('../controllers/avisController');

router.get('/', rechercher);
router.get('/moi', authentifier, autoriser('COMMERCANT'), moi);
router.put('/moi', authentifier, autoriser('COMMERCANT'), validate(modifierBoutiqueSchema), modifierMoi);
router.post('/', authentifier, autoriser('COMMERCANT'), validate(creerBoutiqueSchema), creer);
router.get('/:id/avis', listerBoutique);
router.get('/:id', detail);

module.exports = router;