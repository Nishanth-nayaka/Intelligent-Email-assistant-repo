function compactEmail(email) {
  return {
    id: email.id,
    sender: email.sender,
    subject: email.subject,
    timestamp: email.timestamp,
    snippet: email.snippet,
    content: (email.body || email.snippet || '').slice(0, 6000)
  };
}

function jsonFrom(text) {
  const cleaned = String(text || '').trim();
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fall through to object match
    }
  }

  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      const parsed = JSON.parse(objectMatch[0]);
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch {
      return [];
    }
  }

  return [];
}

function linksFrom(email) {
  return [...new Set(((email.body || email.snippet || '').match(/https?:\/\/[^\s<>"']+/g) || []).slice(0, 5))];
}

function normalizePriority(value) {
  const priority = String(value || '').toLowerCase();
  return ['high', 'medium', 'low'].includes(priority) ? priority : 'low';
}

function parseAnalysis(text, emails) {
  const byId = new Map(emails.map((email) => [email.id, email]));
  return jsonFrom(text).filter((item) => byId.has(item.emailId)).map((item) => {
    const email = byId.get(item.emailId);
    return {
      emailId: email.id,
      sender: email.sender,
      subject: email.subject,
      snippet: email.snippet || '',
      timestamp: email.timestamp,
      priority: normalizePriority(item.priority),
      actionItems: Array.isArray(item.actionItems) ? item.actionItems.filter((value) => typeof value === 'string').slice(0, 4) : [],
      date: typeof item.date === 'string' ? item.date : null,
      dateLabel: typeof item.dateLabel === 'string' ? item.dateLabel : null,
      activityType: typeof item.activityType === 'string' ? item.activityType : 'other',
      description: typeof item.description === 'string' ? item.description : email.subject,
      reason: typeof item.reason === 'string' ? item.reason : 'Detected from this email.',
      isOtp: Boolean(item.isOtp),
      sourceLinks: linksFrom(email)
    };
  });
}

function parseYesterdaySummary(text, emails) {
  const byId = new Map(emails.map((email) => [email.id, email]));
  return jsonFrom(text).filter((item) => byId.has(item.emailId) && typeof item.description === 'string').map((item) => {
    const email = byId.get(item.emailId);
    return {
      emailId: email.id,
      sender: email.sender,
      subject: email.subject,
      snippet: email.snippet || '',
      timestamp: email.timestamp,
      description: item.description,
      sourceLinks: linksFrom(email)
    };
  });
}

function analysisPrompt(emails, now) {
  return `You are the Priority and Action Agent for an email assistant. Analyze only the supplied emails. Current time: ${now.toISOString()}. Return ONLY a JSON array, with one object only for emails that have an action, deadline, meeting/event, urgent/security matter, or a likely OTP/verification code. Never invent dates or facts. Use this exact shape: {"emailId":"","priority":"high|medium|low","actionItems":[""],"date":"ISO-8601 date/time if explicitly or unambiguously stated, otherwise null","dateLabel":"human readable date/deadline, otherwise null","activityType":"deadline|meeting|appointment|event|response|security|otp|other","description":"short direct task or event","reason":"why it matters based on the email","isOtp":false}. Priority: high for today/urgent/security, medium for tomorrow or soon, low for future/non-urgent. Mark isOtp true only for actual likely one-time-password/verification-code messages; never return an OTP value. Emails:\n${JSON.stringify(emails.map(compactEmail))}`;
}

function yesterdaySummaryPrompt(emails, now) {
  return `You are the Email Understanding Agent. Current time: ${now.toISOString()}. Summarize meaningful events in the supplied emails from yesterday. Return ONLY a JSON array of {"emailId":"","description":"concise useful event summary"}. Include security notices, requests, deadlines, meetings, and material updates; omit routine noise. Do not invent facts. Emails:\n${JSON.stringify(emails.map(compactEmail))}`;
}

module.exports = { analysisPrompt, parseAnalysis, parseYesterdaySummary, yesterdaySummaryPrompt };
