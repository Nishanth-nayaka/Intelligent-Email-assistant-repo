const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/integrationController');
router.get('/gmail/oauth/start', authenticate, controller.start);
router.get('/gmail/oauth/callback', controller.callback);
router.get('/gmail/status', authenticate, controller.getStatus);
router.post('/gmail/reconnect', authenticate, controller.start);
module.exports = router;
