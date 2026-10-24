const router = require('express').Router();
const { authentifier } = require('../middlewares/auth');
const notification = require('../controllers/notificationController');

router.use(authentifier);

router.get('/', notification.lister);
router.patch('/lire-tout', notification.toutLire);
router.get('/:id', notification.ouvrir);

module.exports = router;