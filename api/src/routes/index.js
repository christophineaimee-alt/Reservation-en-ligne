const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/categories', require('./categorie.routes'));
router.use('/boutiques', require('./boutique.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/commercant', require('./commercant.routes'));
router.use('/reservations', require('./reservation.routes'));
router.use('/paiements', require('./paiement.routes'));
router.use('/avis', require('./avis.routes'));
router.use('/promotions', require('./promotion.routes'));
router.use('/visiteur', require('./visiteur.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/', require('./catalogue.routes'));

module.exports = router;