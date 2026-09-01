const { getSupabase } = require('../config/supabase');
const monitoringAgent = require('../agents/monitoringAgent');

const table = 'email_activities';

function logFailure(scope, error) {
  console.error(`[activityService.${scope}] ${error && error.message ? error.message : error}`);
}

function unavailable(error) {
  // Failures are logged server-side and surfaced to callers so that activity
  // records are never lost silently or mistaken for an empty history.
  logFailure('recordActivity', error);
  const failure = new Error('Activity history is temporarily unavailable. Please try again.');
  failure.status = 503;
  return failure;
}

function formatRecord(row) {
  return {
    id: row.id,
    emailId: row.email_id,
    activityType: row.activity_type,
    description: row.description,
    metadata: row.metadata || {},
    createdAt: row.created_at
  };
}

// Inserts exactly one activity record for a completed user action. Resolves
// with the stored record or rejects; callers must await it so that a
// successful action never loses its activity record silently.
async function recordActivity(userId, params) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('recordActivity requires an authenticated user id.');
  }
  const formatted = monitoringAgent.formatActivityRecord(params || {});
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(table)
      .insert({
        user_id: userId,
        email_id: formatted.emailId,
        activity_type: formatted.activityType,
        description: formatted.description,
        metadata: formatted.metadata
      })
      .select('id, email_id, activity_type, description, metadata, created_at')
      .single();

    if (error) throw error;
    return formatRecord(data);
  } catch (error) {
    throw unavailable(error);
  }
}

// Lists the user's activity records, newest first. Query failures are
// reported as errors, never as an empty history.
async function listActivities(userId, { limit = 50, offset = 0 } = {}) {
  const requestedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const requestedOffset = Math.max(Number(offset) || 0, 0);

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(table)
      .select('id, email_id, activity_type, description, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(requestedOffset, requestedOffset + requestedLimit - 1);

    if (error) throw error;
    return { activities: (data || []).map(formatRecord) };
  } catch (error) {
    logFailure('listActivities', error);
    const failure = new Error('Could not load your activity history. Please try again.');
    failure.status = 502;
    throw failure;
  }
}

module.exports = {
  listActivities,
  recordActivity
};
