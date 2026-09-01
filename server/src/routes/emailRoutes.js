const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const controller = require('../controllers/emailController');
const mime = require('../utils/mime');

const id = [param('id').isString().trim().notEmpty(), validate];

// Outgoing-message validation. The same rules are re-applied inside
// utils/mime.js at the service boundary, so this is defense in depth.
const requiredRecipients = (field, label) => body(field)
  .isString().trim().notEmpty().withMessage(`${label} recipient is required.`)
  .custom((value) => { mime.parseRecipients(value, label); return true; });
const optionalRecipients = (field, label) => body(field)
  .optional({ values: 'falsy' })
  .isString().withMessage(`${label} must be provided as text.`)
  .custom((value) => { mime.parseRecipients(value, label, { required: false }); return true; });
const requiredSubject = body('subject')
  .isString().trim().notEmpty().withMessage('Subject is required.')
  .custom((value) => { mime.validateSubject(value); return true; });
const optionalSubject = body('subject')
  .optional({ values: 'falsy' })
  .isString().withMessage('Subject must be provided as text.')
  .custom((value) => { mime.validateSubject(value); return true; });

const sendRules = [
  requiredRecipients('to', 'To'),
  optionalRecipients('cc', 'Cc'),
  optionalRecipients('bcc', 'Bcc'),
  requiredSubject,
  body('body').isString().trim().notEmpty().withMessage('Message body cannot be empty.'),
  validate
];
const replyRules = [
  param('id').isString().trim().notEmpty(),
  body('body').isString().trim().notEmpty().withMessage('Reply message body cannot be empty.'),
  optionalRecipients('to', 'To'),
  optionalRecipients('cc', 'Cc'),
  optionalRecipients('bcc', 'Bcc'),
  optionalSubject,
  validate
];

router.use(authenticate);
router.get('/search', [query('q').trim().notEmpty().withMessage('A search query is required.'), validate], controller.list);
router.get('/otp', controller.otp);
router.get('/', controller.list);
router.get('/:id', id, controller.get);
router.post('/send', sendRules, controller.send);
router.post('/:id/reply', replyRules, controller.reply);
router.post('/:id/read', id, controller.read);
router.post('/:id/unread', id, controller.unread);
router.post('/:id/star', id, controller.star);
router.post('/:id/unstar', id, controller.unstar);
router.post('/:id/archive', id, controller.archive);
router.delete('/:id', id, controller.remove);

module.exports = router;
