const { getConnection } = require('./integrationService');
const { createGmailClient } = require('../integrations/gmailIntegration');
const activityService = require('./activityService');
const mime = require('../utils/mime');

function apiError(error) {
  if (error.code === 401 || error.code === 403) {
    const result = new Error('Gmail authorization has expired or is invalid. Reconnect Gmail to continue.');
    result.status = 401;
    return result;
  }
  return error;
}

function decode(value = '') {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function header(headers = [], name) {
  return headers.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function body(part) {
  if (part.body?.data) return decode(part.body.data);
  return (part.parts || []).map(body).filter(Boolean).join('\n');
}

function format(message) {
  const headers = message.payload?.headers || [];
  return {
    id: message.id,
    threadId: message.threadId,
    sender: header(headers, 'From'),
    recipients: header(headers, 'To'),
    subject: header(headers, 'Subject') || '(no subject)',
    timestamp: message.internalDate ? new Date(Number(message.internalDate)).toISOString() : null,
    snippet: message.snippet || '',
    labels: message.labelIds || [],
    isRead: !(message.labelIds || []).includes('UNREAD'),
    isStarred: (message.labelIds || []).includes('STARRED'),
    body: body(message.payload),
    attachments: collectAttachments(message.payload)
  };
}

function collectAttachments(part, result = []) {
  if (part.filename && part.body?.attachmentId) {
    result.push({ filename: part.filename, mimeType: part.mimeType, size: part.body.size });
  }
  (part.parts || []).forEach((item) => collectAttachments(item, result));
  return result;
}

// Records the single activity record for a completed Gmail action. The
// insertion is awaited so a successful action never loses its record; if the
// activity service is unavailable, the (already applied) Gmail action still
// succeeds with an explicit warning instead of a misleading failure that
// could invite a duplicate send.
async function recordActivitySafely(userId, params, successContext) {
  try {
    await activityService.recordActivity(userId, params);
    return { activityLogged: true };
  } catch (error) {
    return {
      activityLogged: false,
      warning: `${successContext} However, it could not be added to your activity history because the activity service is unavailable.`
    };
  }
}

async function gmailFor(userId) {
  const tokens = await getConnection(userId);
  if (!tokens) {
    const error = new Error('Connect Gmail before accessing email.');
    error.status = 409;
    throw error;
  }
  return createGmailClient(tokens);
}

async function list(userId, { q, label, pageToken, maxResults } = {}) {
  try {
    const gmail = await gmailFor(userId);
    const requested = Number(maxResults);
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: Number.isInteger(requested) ? Math.min(Math.max(requested, 1), 50) : 30,
      pageToken: pageToken || undefined,
      q: q || undefined,
      labelIds: label ? [label] : undefined
    });
    const messages = await Promise.all(
      (response.data.messages || []).map(({ id }) =>
        gmail.users.messages.get({ userId: 'me', id, format: 'full' })
      )
    );
    return {
      emails: messages.map((item) => format(item.data)),
      nextPageToken: response.data.nextPageToken || null
    };
  } catch (error) {
    throw apiError(error);
  }
}

async function get(userId, id) {
  try {
    const gmail = await gmailFor(userId);
    const message = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
    const thread = await gmail.users.threads.get({ userId: 'me', id: message.data.threadId, format: 'full' });
    return {
      email: format(message.data),
      thread: (thread.data.messages || []).map(format)
    };
  } catch (error) {
    throw apiError(error);
  }
}

async function modify(userId, id, addLabelIds = [], removeLabelIds = []) {
  try {
    const gmail = await gmailFor(userId);
    await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: { addLabelIds, removeLabelIds }
    });

    // Record exactly one awaited activity record per user action.
    let activityType = null;
    if (addLabelIds.includes('UNREAD')) activityType = 'marked_unread';
    else if (removeLabelIds.includes('UNREAD')) activityType = 'marked_read';
    else if (addLabelIds.includes('STARRED')) activityType = 'starred';
    else if (removeLabelIds.includes('STARRED')) activityType = 'unstarred';
    else if (removeLabelIds.includes('INBOX')) activityType = 'archived';

    const outcome = activityType
      ? await recordActivitySafely(userId, { emailId: id, activityType }, 'The email was updated in Gmail.')
      : { activityLogged: true };

    return { success: true, ...outcome };
  } catch (error) {
    throw apiError(error);
  }
}

async function remove(userId, id) {
  try {
    const gmail = await gmailFor(userId);
    await gmail.users.messages.trash({ userId: 'me', id });
    const outcome = await recordActivitySafely(userId, { emailId: id, activityType: 'deleted' }, 'The email was moved to trash in Gmail.');
    return { success: true, ...outcome };
  } catch (error) {
    throw apiError(error);
  }
}

async function send(userId, { to, cc, bcc, subject, body }) {
  try {
    const gmail = await gmailFor(userId);
    const recipients = {
      to: mime.parseRecipients(to, 'To'),
      cc: cc ? mime.parseRecipients(cc, 'Cc', { required: false }) : '',
      bcc: bcc ? mime.parseRecipients(bcc, 'Bcc', { required: false }) : ''
    };
    const safeSubject = mime.validateSubject(subject);
    const raw = mime.encodeMimeMessage({ ...recipients, subject: safeSubject, body });
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });

    const outcome = await recordActivitySafely(userId, {
      emailId: response.data.id,
      activityType: 'email_sent',
      subject: safeSubject,
      recipient: recipients.to,
      metadata: { to: recipients.to, cc: recipients.cc, bcc: recipients.bcc, messageId: response.data.id, threadId: response.data.threadId }
    }, 'Your email was sent.');

    return {
      success: true,
      messageId: response.data.id,
      threadId: response.data.threadId,
      activityLogged: outcome.activityLogged,
      ...(outcome.warning ? { warning: outcome.warning } : {})
    };
  } catch (error) {
    throw apiError(error);
  }
}

async function reply(userId, emailId, { to, cc, bcc, subject, body }) {
  try {
    const gmail = await gmailFor(userId);
    const parent = await gmail.users.messages.get({ userId: 'me', id: emailId, format: 'full' });
    const headers = parent.data.payload?.headers || [];
    const context = mime.buildReplyContext({
      parentMessageId: header(headers, 'Message-ID') || header(headers, 'Message-Id'),
      parentSubject: header(headers, 'Subject'),
      parentFrom: header(headers, 'From'),
      replyToAddress: header(headers, 'Reply-To'),
      requestedTo: to,
      requestedSubject: subject,
      existingReferences: header(headers, 'References')
    });

    const raw = mime.encodeMimeMessage({ ...context, cc, bcc, body });

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
        threadId: parent.data.threadId
      }
    });

    const outcome = await recordActivitySafely(userId, {
      emailId,
      activityType: 'reply_sent',
      subject: context.subject,
      recipient: context.to,
      metadata: { to: context.to, messageId: response.data.id, threadId: parent.data.threadId }
    }, 'Your reply was sent.');

    return {
      success: true,
      messageId: response.data.id,
      threadId: parent.data.threadId,
      activityLogged: outcome.activityLogged,
      ...(outcome.warning ? { warning: outcome.warning } : {})
    };
  } catch (error) {
    throw apiError(error);
  }
}

module.exports = {
  get,
  list,
  modify,
  remove,
  reply,
  send
};
