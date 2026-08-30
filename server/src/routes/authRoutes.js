const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const credentialRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login or registration attempts. Please try again later.' }
});
const registrationRules = [body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'), body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address.'), body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.')];
router.post('/register', credentialRateLimiter, registrationRules, validate, controller.register);
router.post('/login', credentialRateLimiter, [body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address.'), body('password').notEmpty().withMessage('Password is required.')], validate, controller.login);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
module.exports = router;
