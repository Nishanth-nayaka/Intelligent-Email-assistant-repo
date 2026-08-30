const ai = require('./aiService');
const gmail = require('./gmailService');
const priorityService = require('./priorityService');

async function insights(userId) {
  const { emails } = await gmail.list(userId, { maxResults: 50 });
  const analysis = await ai.analyzeDashboard(emails);
  return { emails, analysis };
}

async function getPriorities(userId) {
  const { analysis } = await insights(userId);
  const priorities = priorityService.filterActionablePriorities(analysis);
  return { items: priorityService.sortPriorities(priorities) };
}

async function getOtpEmails(userId) {
  const { analysis } = await insights(userId);
  return { emails: priorityService.filterOtpEmails(analysis) };
}

async function getDashboard(userId) {
  const now = new Date();
  const { emails, analysis } = await insights(userId);
  const priorities = priorityService.filterActionablePriorities(analysis);
  const priorityCounts = priorityService.calculatePriorityCounts(priorities);
  const upcoming = priorityService.filterUpcomingActivities(priorities, now);
  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);
  const yesterdayKey = priorityService.safeDayKey(yesterday);
  const yesterdayEmails = emails.filter(
    (email) => email.timestamp && priorityService.safeDayKey(email.timestamp) === yesterdayKey
  );
  const yesterdaySummary = await ai.summarizeYesterday(yesterdayEmails, now);

  return {
    generatedBy: 'AI',
    generatedAt: now.toISOString(),
    priorities: priorityService.sortPriorities(priorities),
    priorityCounts,
    yesterdaySummary,
    upcoming
  };
}

async function getYesterdaySummary(userId) {
  const dashboard = await getDashboard(userId);
  return { generatedBy: dashboard.generatedBy, items: dashboard.yesterdaySummary };
}

async function getUpcoming(userId) {
  const dashboard = await getDashboard(userId);
  return { generatedBy: dashboard.generatedBy, items: dashboard.upcoming };
}

module.exports = {
  getDashboard,
  getOtpEmails,
  getPriorities,
  getUpcoming,
  getYesterdaySummary
};
