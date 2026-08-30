const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
function authenticate(req, res, next) { const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null; if (!token) return res.status(401).json({ message: 'Authentication is required.' }); try { const payload = jwt.verify(token, jwtSecret); req.user = { id: payload.sub, email: payload.email }; return next(); } catch { return res.status(401).json({ message: 'Your session is invalid or has expired.' }); } }
module.exports = { authenticate };
