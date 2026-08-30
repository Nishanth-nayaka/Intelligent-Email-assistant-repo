const gmail = require('../services/gmailService');
const dashboard = require('../services/dashboardService');
async function list(req, res, next) { try { res.json(await gmail.list(req.user.id, req.query)); } catch (error) { next(error); } }
async function get(req, res, next) { try { res.json(await gmail.get(req.user.id, req.params.id)); } catch (error) { next(error); } }
async function read(req, res, next) { try { res.json(await gmail.modify(req.user.id, req.params.id, [], ['UNREAD'])); } catch (error) { next(error); } }
async function unread(req, res, next) { try { res.json(await gmail.modify(req.user.id, req.params.id, ['UNREAD'])); } catch (error) { next(error); } }
async function star(req, res, next) { try { res.json(await gmail.modify(req.user.id, req.params.id, ['STARRED'])); } catch (error) { next(error); } }
async function unstar(req, res, next) { try { res.json(await gmail.modify(req.user.id, req.params.id, [], ['STARRED'])); } catch (error) { next(error); } }
async function archive(req, res, next) { try { res.json(await gmail.modify(req.user.id, req.params.id, [], ['INBOX'])); } catch (error) { next(error); } }
async function remove(req, res, next) { try { res.json(await gmail.remove(req.user.id, req.params.id)); } catch (error) { next(error); } }
async function otp(req, res, next) { try { res.json(await dashboard.getOtpEmails(req.user.id)); } catch (error) { next(error); } }
module.exports = { archive, get, list, otp, read, remove, star, unread, unstar };
