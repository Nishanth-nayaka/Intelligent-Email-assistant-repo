const dashboard = require('../services/dashboardService');
async function getDashboard(req, res, next) { try { res.json(await dashboard.getDashboard(req.user.id)); } catch (error) { next(error); } }
async function priorities(req, res, next) { try { res.json(await dashboard.getPriorities(req.user.id)); } catch (error) { next(error); } }
async function summary(req, res, next) { try { res.json(await dashboard.getYesterdaySummary(req.user.id)); } catch (error) { next(error); } }
async function upcoming(req, res, next) { try { res.json(await dashboard.getUpcoming(req.user.id)); } catch (error) { next(error); } }
module.exports = { getDashboard, priorities, summary, upcoming };
