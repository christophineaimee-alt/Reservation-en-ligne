const router = require('express').Router();
const { publiques } = require('../controllers/promotionController');

// Public : les offres spéciales en cours
router.get('/', publiques);

module.exports = router;