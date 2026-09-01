const gmail = require('./gmailService');
const activityService = require('./activityService');
const understanding = require('../agents/emailUnderstandingAgent');
const priorityAction = require('../agents/priorityActionAgent');
const { replyPrompt } = require('../agents/responseAgent');
const { validateGeneratedReply } = require('../agents/validationAgent');

function requireGeminiConfig() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('AI features are not configured. Set GEMINI_API_KEY on the backend to continue.');
    error.status = 503;
    throw error;
  }
}

// Bounds each Gemini attempt so a stalled "high demand" connection can no
// longer hold requests open for minutes (undici's default is ~5 minutes).
const GEMINI_DEFAULT_TIMEOUT_MS = 30000;
// Gemini statuses that signal a temporary condition worth one short retry.
const GEMINI_RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const GEMINI_RETRY_DELAY_MS = 1000;

function geminiTimeoutMs() {
  return Math.max(Number(process.env.GEMINI_TIMEOUT_MS) || GEMINI_DEFAULT_TIMEOUT_MS, 1000);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestGemini(model, prompt) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      }),
      signal: AbortSignal.timeout(geminiTimeoutMs())
    }
  );
}

async function generate(prompt) {
  requireGeminiConfig();
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  let response;
  try {
    response = await requestGemini(model, prompt);
    // At most one short retry when Gemini itself signals a temporary failure
    // (e.g. HTTP 503 "high demand"); never retried in a loop. Timeouts and
    // network failures are not retried so the worst-case wait stays bounded.
    if (GEMINI_RETRYABLE_STATUSES.has(response.status)) {
      await delay(GEMINI_RETRY_DELAY_MS);
      response = await requestGemini(model, prompt);
    }
  } catch (requestError) {
    if (process.env.NODE_ENV !== 'production') {
      const timedOut = requestError.name === 'TimeoutError' || requestError.name === 'AbortError';
      console.error(
        `[Gemini API Error] ${timedOut ? `request timed out after ${geminiTimeoutMs()}ms` : 'request failed before a response was received'}: ${requestError.message}`
      );
    }
    const error = new Error('Unable to reach the AI service. Please try again.');
    error.status = 503;
    throw error;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[Gemini API Error] status=${response.status} message=${payload.error?.message || response.statusText}`
      );
    }
    const temporary = GEMINI_RETRYABLE_STATUSES.has(response.status);
    const error = new Error(
      temporary
        ? 'The AI service is temporarily busy. Please try again in a moment.'
        : 'AI generation failed. Please try again.'
    );
    error.status = response.status === 401 || response.status === 403 || temporary ? 503 : 502;
    throw error;
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text) {
    const error = new Error('The AI did not return a usable result. Please try again.');
    error.status = 502;
    throw error;
  }
  return text;
}

async function source(userId, emailId) {
  return gmail.get(userId, emailId);
}

// Records the activity for a completed AI action without discarding the
// already-generated AI result when the activity service is unavailable.
async function recordActivitySafely(userId, params) {
  try {
    await activityService.recordActivity(userId, params);
    return { activityLogged: true };
  } catch (error) {
    return {
      activityLogged: false,
      warning: 'The AI result was generated, but it could not be added to your activity history because the activity service is unavailable.'
    };
  }
}

async function summarize(userId, emailId) {
  const { email } = await source(userId, emailId);
  const summary = await generate(understanding.summaryPrompt(email));
  const outcome = await recordActivitySafely(userId, {
    emailId,
    activityType: 'summarized',
    subject: email.subject,
    sender: email.sender
  });
  return { emailId, summary, generatedBy: 'AI', ...outcome };
}

async function explain(userId, emailId) {
  const { email } = await source(userId, emailId);
  const explanation = await generate(understanding.explanationPrompt(email));
  const outcome = await recordActivitySafely(userId, {
    emailId,
    activityType: 'explained',
    subject: email.subject,
    sender: email.sender
  });
  return { emailId, explanation, generatedBy: 'AI', ...outcome };
}

async function classify(userId, emailId) {
  const { email } = await source(userId, emailId);
  const category = understanding.normalizeCategory(await generate(understanding.classificationPrompt(email)));
  const outcome = await recordActivitySafely(userId, {
    emailId,
    activityType: 'classified',
    subject: email.subject,
    category
  });
  return { emailId, category, generatedBy: 'AI', ...outcome };
}

async function reply(userId, emailId) {
  const { email, thread } = await source(userId, emailId);
  const replyData = validateGeneratedReply(await generate(replyPrompt(email, thread)));
  const outcome = await recordActivitySafely(userId, {
    emailId,
    activityType: 'reply_generated',
    subject: email.subject,
    sender: email.sender
  });
  return { emailId, generatedBy: 'AI', ...outcome, ...replyData };
}

async function analyzeDashboard(emails, now = new Date()) {
  if (!emails.length) return [];
  return priorityAction.parseAnalysis(await generate(priorityAction.analysisPrompt(emails, now)), emails);
}

async function summarizeYesterday(emails, now = new Date()) {
  if (!emails.length) return [];
  return priorityAction.parseYesterdaySummary(await generate(priorityAction.yesterdaySummaryPrompt(emails, now)), emails);
}

module.exports = { analyzeDashboard, classify, explain, generate, reply, summarize, summarizeYesterday };
