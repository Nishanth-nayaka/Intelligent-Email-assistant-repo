const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getSupabase } = require('../config/supabase');
const { jwtSecret } = require('../config/env');
const { createOAuthClient, scopes } = require('../integrations/gmailIntegration');

const table = 'gmail_connections';
const key = crypto.createHash('sha256').update(process.env.GMAIL_TOKEN_ENCRYPTION_KEY || jwtSecret).digest();

function encrypt(value) {
  if (!value) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64')}.${ciphertext.toString('base64')}.${cipher.getAuthTag().toString('base64')}`;
}
function decrypt(value) {
  const [iv, ciphertext, tag] = value.split('.').map((part) => Buffer.from(part, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
function getAuthorizationUrl(userId) {
  const state = jwt.sign({ sub: userId, purpose: 'gmail-oauth' }, jwtSecret, { expiresIn: '10m' });
  return createOAuthClient().generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes, state });
}
async function saveConnection(userId, tokens) {
  const supabase = getSupabase();
  let refreshToken = tokens.refresh_token;
  if (!refreshToken) {
    const { data } = await supabase.from(table).select('encrypted_refresh_token').eq('user_id', userId).maybeSingle();
    refreshToken = data?.encrypted_refresh_token ? decrypt(data.encrypted_refresh_token) : null;
  }
  const { error } = await supabase.from(table).upsert({
    user_id: userId, provider: 'gmail', encrypted_access_token: encrypt(tokens.access_token),
    encrypted_refresh_token: encrypt(refreshToken), token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    scopes: tokens.scope || scopes.join(' '), connected_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
  if (error) throw error;
}
async function exchangeCallback(code, state) {
  let payload;
  try { payload = jwt.verify(state, jwtSecret); } catch { const error = new Error('The Gmail connection request expired. Please try again.'); error.status = 400; throw error; }
  if (payload.purpose !== 'gmail-oauth') { const error = new Error('Invalid Gmail connection request.'); error.status = 400; throw error; }
  const { tokens } = await createOAuthClient().getToken(code);
  await saveConnection(payload.sub, tokens);
}
async function getConnection(userId) {
  const { data, error } = await getSupabase().from(table).select('encrypted_access_token, encrypted_refresh_token, token_expiry, connected_at, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { access_token: decrypt(data.encrypted_access_token), refresh_token: data.encrypted_refresh_token ? decrypt(data.encrypted_refresh_token) : undefined, expiry_date: data.token_expiry ? new Date(data.token_expiry).getTime() : undefined };
}
async function status(userId) {
  const { data, error } = await getSupabase().from(table).select('provider, connected_at, updated_at, token_expiry').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? { connected: true, provider: data.provider, connectedAt: data.connected_at, tokenExpiry: data.token_expiry } : { connected: false };
}
module.exports = { exchangeCallback, getAuthorizationUrl, getConnection, status };
