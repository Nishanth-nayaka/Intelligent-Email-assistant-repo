const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/dashboardController');
router.use(authenticate);
router.get('/', controller.getDashboard);
router.get('/priorities', controller.priorities);
router.get('/summary', controller.summary);
router.get('/upcoming', controller.upcoming);
module.exports = router;
