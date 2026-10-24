const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authentifier, autoriser } = require('../middlewares/auth');

const {
  creerProduitServiceSchema,
  modifierProduitServiceSchema,
  stockSchema,
} = require('../validators/catalogue.validator');
const { horairesSchema } = require('../validators/horaire.validator');
const {
  creerDisponibiliteSchema,
  modifierDisponibiliteSchema,
  genererDisponibilitesSchema,
} = require('../validators/disponibilite.validator');
const { refuserReservationSchema } = require('../validators/reservation.validator');

const catalogue = require('../controllers/catalogueController');
const stock = require('../controllers/stockController');
const horaire = require('../controllers/horaireController');
const dispo = require('../controllers/disponibiliteController');
const reservation = require('../controllers/reservationCommercantController');
const client = require('../controllers/clientController');
const tableauBord = require('../controllers/tableauBordController');
const paiementCommercant = require('../controllers/paiementCommercantController');
const avisCommercant = require('../controllers/avisController');
const { reponseSchema } = require('../validators/avis.validator');
const promotionCommercant = require('../controllers/promotionController');
const { promotionSchema, activationSchema } = require('../validators/promotion.validator');

router.use(authentifier, autoriser('COMMERCANT'));

// UC12 : produits et services
router.get('/produits-services', catalogue.mesArticles);
router.post('/produits-services', validate(creerProduitServiceSchema), catalogue.creer);
router.put('/produits-services/:id', validate(modifierProduitServiceSchema), catalogue.modifier);
router.delete('/produits-services/:id', catalogue.supprimer);

// UC13 : stock
router.get('/produits-services/:id/stock', stock.voir);
router.put('/produits-services/:id/stock', validate(stockSchema), stock.modifier);

// UC14 : horaires
router.get('/horaires', horaire.lister);
router.put('/horaires', validate(horairesSchema), horaire.modifier);

// UC15 : disponibilités
router.get('/disponibilites', dispo.lister);
router.post('/disponibilites', validate(creerDisponibiliteSchema), dispo.creer);
router.post('/disponibilites/generer', validate(genererDisponibilitesSchema), dispo.generer);
router.put('/disponibilites/:id', validate(modifierDisponibiliteSchema), dispo.modifier);
router.delete('/disponibilites/:id', dispo.supprimer);

// UC16, UC17, UC18 : réservations de la boutique
router.get('/reservations', reservation.lister);
router.get('/reservations/:id', reservation.detail);
router.patch('/reservations/:id/acceptation', reservation.accepter);
router.patch('/reservations/:id/refus', validate(refuserReservationSchema), reservation.refuser);
router.patch('/reservations/:id/annulation', reservation.annuler);

// UC19 : clients de la boutique
router.get('/clients', client.lister);
router.get('/clients/:id', client.detail);

// UC20 : tableau de bord
router.get('/tableau-de-bord', tableauBord.indicateurs);

// Évaluation des paiements reçus
router.get('/paiements', paiementCommercant.evaluation);
// Avis des clients et réponses
router.get('/avis', avisCommercant.listerCommercant);
router.patch('/avis/:id/reponse', validate(reponseSchema), avisCommercant.repondre);

// Promotions et offres spéciales
router.get('/promotions', promotionCommercant.lister);
router.post('/promotions', validate(promotionSchema), promotionCommercant.creer);
router.put('/promotions/:id', validate(promotionSchema), promotionCommercant.modifier);
router.patch('/promotions/:id/activation', validate(activationSchema), promotionCommercant.basculer);
router.delete('/promotions/:id', promotionCommercant.supprimer);

module.exports = router;