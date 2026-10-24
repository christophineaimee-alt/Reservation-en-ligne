const router = require('express').Router();
const { catalogue, detail } = require('../controllers/catalogueController');
const { consulter } = require('../controllers/disponibiliteController');

router.get('/boutiques/:id/catalogue', catalogue);
router.get('/produits-services/:id', detail);
router.get('/produits-services/:id/disponibilites', consulter);

module.exports = router;