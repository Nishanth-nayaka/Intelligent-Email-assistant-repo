const activityService = require('../services/activityService');

async function list(req, res, next) {
  try {
    res.json(await activityService.listActivities(req.user.id, req.query));
  } catch (error) {
    next(error);
  }
}

module.exports = { list };
