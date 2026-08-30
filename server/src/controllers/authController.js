const authService = require('../services/authService');
async function register(req, res, next) { try { res.status(201).json(await authService.register(req.body)); } catch (error) { next(error); } }
async function login(req, res, next) { try { res.json(await authService.login(req.body)); } catch (error) { next(error); } }
async function me(req, res, next) { try { res.json({ user: await authService.getCurrentUser(req.user.id) }); } catch (error) { next(error); } }
function logout(req, res) { res.status(204).send(); }
module.exports = { register, login, me, logout };
