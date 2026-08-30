const categories = ['Work', 'Personal', 'Education', 'Finance', 'Notifications', 'Security', 'Promotions', 'Other'];
function emailContext(email) { return `From: ${email.sender}\nTo: ${email.recipients}\nSubject: ${email.subject}\nDate: ${email.timestamp || 'Unknown'}\n\n${email.body || email.snippet || ''}`; }
function summaryPrompt(email) { return `Summarize this email concisely for its recipient. Cover the main purpose, important information, requests, deadlines, meetings/events, required actions, and useful links only when present. Do not invent facts.\n\n${emailContext(email)}`; }
function explanationPrompt(email) { return `Explain this email in simple, direct language. State what the sender is saying, why it may matter, what the recipient needs to do, and any deadlines or requests. Do not invent facts.\n\n${emailContext(email)}`; }
function classificationPrompt(email) { return `Classify this email using exactly one of these categories: ${categories.join(', ')}. Return only the category name. Do not infer sensitive facts beyond the message.\n\n${emailContext(email)}`; }
function normalizeCategory(value) { const normalized = String(value || '').trim().toLowerCase(); return categories.find((category) => category.toLowerCase() === normalized) || 'Other'; }
module.exports = { classificationPrompt, explanationPrompt, normalizeCategory, summaryPrompt };
