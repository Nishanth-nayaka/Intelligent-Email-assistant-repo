const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSupabase } = require('../config/supabase');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const safeUser = ({ id, name, email, created_at }) => ({ id, name, email, createdAt: created_at });
const signToken = (user) => jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
async function register({ name, email, password }) { const supabase = getSupabase(); const normalizedEmail = email.trim().toLowerCase(); const passwordHash = await bcrypt.hash(password, 12); const { data, error } = await supabase.from('users').insert({ name: name.trim(), email: normalizedEmail, password_hash: passwordHash }).select('id, name, email, created_at').single(); if (error?.code === '23505') { const duplicate = new Error('An account with that email already exists.'); duplicate.status = 409; throw duplicate; } if (error) throw error; return { user: safeUser(data), token: signToken(data) }; }
async function login({ email, password }) { const supabase = getSupabase(); const { data: user, error } = await supabase.from('users').select('id, name, email, password_hash, created_at').eq('email', email.trim().toLowerCase()).maybeSingle(); if (error) throw error; if (!user || !(await bcrypt.compare(password, user.password_hash))) { const authError = new Error('Invalid email or password.'); authError.status = 401; throw authError; } await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id); return { user: safeUser(user), token: signToken(user) }; }
async function getCurrentUser(id) { const { data, error } = await getSupabase().from('users').select('id, name, email, created_at').eq('id', id).single(); if (error || !data) { const notFound = new Error('User not found.'); notFound.status = 404; throw notFound; } return safeUser(data); }
module.exports = { register, login, getCurrentUser };
