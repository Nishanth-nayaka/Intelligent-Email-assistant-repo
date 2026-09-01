const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/activityController');

router.use(authenticate);
router.get('/', controller.list);

module.exports = router;
