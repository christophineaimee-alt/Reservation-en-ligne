const router = require('express').Router();
const { authentifier, autoriser } = require('../middlewares/auth');
const paiement = require('../controllers/paiementController');

router.use(authentifier, autoriser('CLIENT'));

// Historique des paiements du client connecté
router.get('/', paiement.lister);

// Reçu d'un paiement réussi
router.get('/:id/recu', paiement.recu);

// Le téléphone interroge cette route jusqu'à l'état final du paiement
router.get('/:id', paiement.statut);

module.exports = router;