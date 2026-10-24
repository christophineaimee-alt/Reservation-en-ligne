const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier, autoriser } = require('../middlewares/auth');
const { creerReservationSchema } = require('../validators/reservation.validator');
const { payerSchema } = require('../validators/paiement.validator');
const reservation = require('../controllers/reservationController');
const paiement = require('../controllers/paiementController');

router.use(authentifier, autoriser('CLIENT'));

router.post('/', validate(creerReservationSchema), reservation.creer);
router.get('/', reservation.lister);
router.get('/:id', reservation.detail);
router.patch('/:id/annulation', reservation.annuler);

// Payer une réservation acceptée
router.post('/:id/paiement', validate(payerSchema), paiement.payer);

module.exports = router;