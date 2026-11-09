const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier, autoriser } = require('../middlewares/auth');
const { positionSchema } = require('../validators/proximite.validator');
const { proches, maPosition, definirPosition } = require('../controllers/proximiteController');

// Public : boutiques proches d'un point
router.get('/boutiques', proches);
// Commerçant : position de sa boutique
router.get('/ma-boutique', authentifier, autoriser('COMMERCANT'), maPosition);
router.put('/ma-boutique', authentifier, autoriser('COMMERCANT'), validate(positionSchema), definirPosition);

module.exports = router;
