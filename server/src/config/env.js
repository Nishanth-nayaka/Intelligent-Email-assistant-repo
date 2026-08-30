const dotenv = require('dotenv');
dotenv.config();
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
function validateEnv() { const missing = required.filter((key) => !process.env[key]); if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`); }
function requireGoogleConfig() {
  const keys = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Gmail integration is not configured. Missing: ${missing.join(', ')}`);
    error.status = 503;
    throw error;
  }
}
module.exports = { port: Number(process.env.PORT) || 5000, clientUrl: process.env.CLIENT_URL || 'http://localhost:3000', jwtSecret: process.env.JWT_SECRET, jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d', requireGoogleConfig, validateEnv };
