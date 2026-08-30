const priorityWeight = { high: 0, medium: 1, low: 2 };

const startOfUtcDay = (date) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

function safeDayKey(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function activityFor(item, now = new Date()) {
  if (!item.date) return null;
  const date = new Date(item.date);
  if (Number.isNaN(date.getTime())) return null;
  const daysAway = Math.round((startOfUtcDay(date) - startOfUtcDay(now)) / 86400000);
  return { ...item, daysAway };
}

function sortPriorities(items = []) {
  return [...items].sort((a, b) => (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3));
}

function calculatePriorityCounts(items = []) {
  return items.reduce(
    (counts, item) => ({
      ...counts,
      [item.priority]: (counts[item.priority] || 0) + 1
    }),
    { high: 0, medium: 0, low: 0 }
  );
}

function filterActionablePriorities(analysis = []) {
  return analysis.filter(
    (item) => !item.isOtp && (item.actionItems?.length || item.date || item.priority !== 'low')
  );
}

function filterUpcomingActivities(priorities = [], now = new Date()) {
  return priorities
    .map((item) => activityFor(item, now))
    .filter((item) => item && (item.daysAway === 1 || item.daysAway === 2))
    .sort((a, b) => a.daysAway - b.daysAway);
}

function filterOtpEmails(analysis = []) {
  return analysis.filter((item) => item.isOtp);
}

module.exports = {
  activityFor,
  calculatePriorityCounts,
  filterActionablePriorities,
  filterOtpEmails,
  filterUpcomingActivities,
  safeDayKey,
  sortPriorities
};

