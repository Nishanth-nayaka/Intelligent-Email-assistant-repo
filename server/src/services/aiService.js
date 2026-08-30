const gmail = require('./gmailService');
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

async function generate(prompt) {
  requireGeminiConfig();
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      }
    );
  } catch {
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
    const error = new Error('AI generation failed. Please try again.');
    error.status = response.status === 401 || response.status === 403 ? 503 : 502;
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

async function summarize(userId, emailId) {
  const { email } = await source(userId, emailId);
  return { emailId, summary: await generate(understanding.summaryPrompt(email)), generatedBy: 'AI' };
}

async function explain(userId, emailId) {
  const { email } = await source(userId, emailId);
  return { emailId, explanation: await generate(understanding.explanationPrompt(email)), generatedBy: 'AI' };
}

async function classify(userId, emailId) {
  const { email } = await source(userId, emailId);
  return { emailId, category: understanding.normalizeCategory(await generate(understanding.classificationPrompt(email))), generatedBy: 'AI' };
}

async function reply(userId, emailId) {
  const { email, thread } = await source(userId, emailId);
  return { emailId, generatedBy: 'AI', ...validateGeneratedReply(await generate(replyPrompt(email, thread))) };
}

async function analyzeDashboard(emails, now = new Date()) {
  if (!emails.length) return [];
  return priorityAction.parseAnalysis(await generate(priorityAction.analysisPrompt(emails, now)), emails);
}

async function summarizeYesterday(emails, now = new Date()) {
  if (!emails.length) return [];
  return priorityAction.parseYesterdaySummary(await generate(priorityAction.yesterdaySummaryPrompt(emails, now)), emails);
}

module.exports = { analyzeDashboard, classify, explain, reply, summarize, summarizeYesterday };
