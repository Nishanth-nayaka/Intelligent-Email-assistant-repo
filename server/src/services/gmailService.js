const { getConnection } = require('./integrationService');
const { createGmailClient } = require('../integrations/gmailIntegration');

function apiError(error) {
  if (error.code === 401 || error.code === 403) { const result = new Error('Gmail authorization has expired or is invalid. Reconnect Gmail to continue.'); result.status = 401; return result; }
  return error;
}
function decode(value = '') { return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'); }
function header(headers = [], name) { return headers.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value || ''; }
function body(part) {
  if (part.body?.data) return decode(part.body.data);
  return (part.parts || []).map(body).filter(Boolean).join('\n');
}
function format(message) {
  const headers = message.payload?.headers || [];
  return { id: message.id, threadId: message.threadId, sender: header(headers, 'From'), recipients: header(headers, 'To'), subject: header(headers, 'Subject') || '(no subject)', timestamp: message.internalDate ? new Date(Number(message.internalDate)).toISOString() : null, snippet: message.snippet || '', labels: message.labelIds || [], isRead: !(message.labelIds || []).includes('UNREAD'), isStarred: (message.labelIds || []).includes('STARRED'), body: body(message.payload), attachments: collectAttachments(message.payload) };
}
function collectAttachments(part, result = []) { if (part.filename && part.body?.attachmentId) result.push({ filename: part.filename, mimeType: part.mimeType, size: part.body.size }); (part.parts || []).forEach((item) => collectAttachments(item, result)); return result; }
async function gmailFor(userId) { const tokens = await getConnection(userId); if (!tokens) { const error = new Error('Connect Gmail before accessing email.'); error.status = 409; throw error; } return createGmailClient(tokens); }
async function list(userId, { q, label, pageToken, maxResults } = {}) { try { const gmail = await gmailFor(userId); const requested = Number(maxResults); const response = await gmail.users.messages.list({ userId: 'me', maxResults: Number.isInteger(requested) ? Math.min(Math.max(requested, 1), 50) : 30, pageToken: pageToken || undefined, q: q || undefined, labelIds: label ? [label] : undefined }); const messages = await Promise.all((response.data.messages || []).map(({ id }) => gmail.users.messages.get({ userId: 'me', id, format: 'full' }))); return { emails: messages.map((item) => format(item.data)), nextPageToken: response.data.nextPageToken || null }; } catch (error) { throw apiError(error); } }
async function get(userId, id) { try { const gmail = await gmailFor(userId); const message = await gmail.users.messages.get({ userId: 'me', id, format: 'full' }); const thread = await gmail.users.threads.get({ userId: 'me', id: message.data.threadId, format: 'full' }); return { email: format(message.data), thread: (thread.data.messages || []).map(format) }; } catch (error) { throw apiError(error); } }
async function modify(userId, id, addLabelIds = [], removeLabelIds = []) { try { const gmail = await gmailFor(userId); await gmail.users.messages.modify({ userId: 'me', id, requestBody: { addLabelIds, removeLabelIds } }); return { success: true }; } catch (error) { throw apiError(error); } }
async function remove(userId, id) { try { const gmail = await gmailFor(userId); await gmail.users.messages.trash({ userId: 'me', id }); return { success: true }; } catch (error) { throw apiError(error); } }
module.exports = { get, list, modify, remove };
