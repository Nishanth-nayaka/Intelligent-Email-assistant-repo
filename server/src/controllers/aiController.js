const ai = require('../services/aiService');
async function summarize(req, res, next) { try { res.json(await ai.summarize(req.user.id, req.params.emailId)); } catch (error) { next(error); } }
async function reply(req, res, next) { try { res.json(await ai.reply(req.user.id, req.params.emailId)); } catch (error) { next(error); } }
async function explain(req, res, next) { try { res.json(await ai.explain(req.user.id, req.params.emailId)); } catch (error) { next(error); } }
async function classify(req, res, next) { try { res.json(await ai.classify(req.user.id, req.params.emailId)); } catch (error) { next(error); } }
module.exports = { classify, explain, reply, summarize };
