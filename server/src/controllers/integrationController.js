const integrationService = require('../services/integrationService');
const { clientUrl } = require('../config/env');
async function start(req, res, next) { try { res.json({ authorizationUrl: integrationService.getAuthorizationUrl(req.user.id) }); } catch (error) { next(error); } }
async function callback(req, res, next) { try { await integrationService.exchangeCallback(req.query.code, req.query.state); res.redirect(`${clientUrl}/integrations?gmail=connected`); } catch (error) { next(error); } }
async function getStatus(req, res, next) { try { res.json(await integrationService.status(req.user.id)); } catch (error) { next(error); } }
module.exports = { start, callback, getStatus };
