// Pure MIME composition and outgoing-email validation helpers.
// emailRoutes uses parseRecipients/validateSubject for request validation and
// gmailService uses encodeMimeMessage/buildReplyContext at the single
// authoritative boundary where outgoing messages are built and sent.

const MAX_RECIPIENTS = 50;
const MAX_SUBJECT_LENGTH = 255;
const MAX_ENCODED_WORD_BYTES = 45; // 45 bytes -> 60 base64 chars -> 72-char encoded word (limit 75)
const BODY_CHUNK_LENGTH = 76;

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/;

function invalidRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

// Extracts the bare address from values like "Jane Doe <jane@example.com>".
function extractAddress(value) {
  const text = String(value || '').trim();
  const bracketed = text.match(/<([^<>]*)>/);
  return (bracketed ? bracketed[1] : text).trim();
}

// Header-injection guard: rejects CR/LF and other control characters that
// could smuggle extra MIME headers into the raw message.
function assertHeaderSafe(value, field) {
  if (CONTROL_CHAR_PATTERN.test(value)) {
    throw invalidRequest(`${field} contains invalid control characters.`);
  }
}

// Validates a comma-separated recipient list and returns it normalized
// ("a@x.com, b@y.com"). Throws a 400 error for empty, malformed, or
// header-injecting input.
function parseRecipients(value, field, { required = true } = {}) {
  if (typeof value !== 'string' && value !== undefined && value !== null) {
    throw invalidRequest(`${field} must be provided as text.`);
  }
  const raw = typeof value === 'string' ? value : '';
  if (!raw.trim()) {
    if (required) throw invalidRequest(`${field} recipient is required.`);
    return '';
  }
  assertHeaderSafe(raw, field);
  const addresses = raw.split(',').map((item) => item.trim()).filter(Boolean);
  if (!addresses.length) throw invalidRequest(`${field} recipient is required.`);
  if (addresses.length > MAX_RECIPIENTS) {
    throw invalidRequest(`${field} accepts at most ${MAX_RECIPIENTS} recipients.`);
  }
  const malformed = addresses.find((address) => !EMAIL_PATTERN.test(address));
  if (malformed) {
    throw invalidRequest(`${field} contains an invalid email address: ${malformed.slice(0, 120)}`);
  }
  return addresses.join(', ');
}

// Validates the subject: text only, no control characters, bounded length.
function validateSubject(value) {
  if (typeof value !== 'string' || !value.trim()) throw invalidRequest('Subject is required.');
  assertHeaderSafe(value, 'Subject');
  if (value.length > MAX_SUBJECT_LENGTH) {
    throw invalidRequest(`Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer.`);
  }
  return value.trim();
}

function validateBody(value) {
  if (typeof value !== 'string') throw invalidRequest('Message body must be provided as text.');
  return value;
}

// Message-IDs originate from Gmail headers; strip any control characters
// before embedding them in In-Reply-To/References headers.
function sanitizeMessageId(value) {
  return String(value || '').replace(CONTROL_CHAR_PATTERN, '').trim();
}

// RFC 2047 UTF-8 subject. The subject is split on complete characters so that
// every encoded word stays within the 75-character limit; adjacent encoded
// words are folded with CRLF + space and decode back in order.
function encodeUtf8Subject(subject) {
  const chunks = [];
  let current = '';
  let currentBytes = 0;
  for (const character of Array.from(subject)) {
    const characterBytes = Buffer.byteLength(character, 'utf8');
    if (current && currentBytes + characterBytes > MAX_ENCODED_WORD_BYTES) {
      chunks.push(current);
      current = '';
      currentBytes = 0;
    }
    current += character;
    currentBytes += characterBytes;
  }
  if (current) chunks.push(current);
  return chunks
    .map((chunk) => `=?utf-8?B?${Buffer.from(chunk, 'utf8').toString('base64')}?=`)
    .join('\r\n ');
}

// RFC 2045 base64 body (UTF-8 safe, folded to 76-character lines).
function encodeBody(body) {
  const base64 = Buffer.from(body, 'utf8').toString('base64');
  return (base64.match(new RegExp(`.{1,${BODY_CHUNK_LENGTH}}`, 'g')) || []).join('\r\n');
}

// Builds the raw base64url MIME message for gmail.users.messages.send. Every
// header-bearing field is validated here, making this the single
// authoritative boundary for outgoing message safety.
function encodeMimeMessage({ to, cc, bcc, subject, body, inReplyTo, references }) {
  const recipients = parseRecipients(to, 'To');
  const carbon = cc ? parseRecipients(cc, 'Cc', { required: false }) : '';
  const blind = bcc ? parseRecipients(bcc, 'Bcc', { required: false }) : '';
  const safeSubject = validateSubject(subject);
  const safeBody = validateBody(body);

  const headers = [
    `To: ${recipients}`,
    carbon ? `Cc: ${carbon}` : '',
    blind ? `Bcc: ${blind}` : '',
    `Subject: ${encodeUtf8Subject(safeSubject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    inReplyTo ? `In-Reply-To: ${sanitizeMessageId(inReplyTo)}` : '',
    references ? `References: ${sanitizeMessageId(references)}` : ''
  ].filter(Boolean);

  const rawMessage = `${headers.join('\r\n')}\r\n\r\n${encodeBody(safeBody)}`;
  return Buffer.from(rawMessage, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Derives reply headers from the parent message: recipient (Reply-To or From
// fallback), "Re:" subject (without stacking prefixes), and the In-Reply-To /
// References threading headers. Client-supplied overrides win when given.
function buildReplyContext({ parentMessageId = '', parentSubject = '', parentFrom = '', replyToAddress = '', requestedTo = '', requestedSubject = '', existingReferences = '' } = {}) {
  const to = requestedTo
    ? parseRecipients(requestedTo, 'To')
    : parseRecipients(extractAddress(replyToAddress || parentFrom), 'To', { required: false });
  if (!to) throw invalidRequest('Could not determine a reply recipient for this email.');

  const baseSubject = String(parentSubject || '').trim() || '(no subject)';
  let subject;
  if (requestedSubject) {
    subject = validateSubject(requestedSubject);
  } else {
    subject = /^re:/i.test(baseSubject) ? baseSubject : `Re: ${baseSubject}`;
    if (subject.length > MAX_SUBJECT_LENGTH) subject = Array.from(subject).slice(0, MAX_SUBJECT_LENGTH).join('');
  }

  const messageId = sanitizeMessageId(parentMessageId);
  const references = [existingReferences, messageId].map(sanitizeMessageId).filter(Boolean).join(' ');
  return { to, subject, inReplyTo: messageId, references };
}

module.exports = {
  EMAIL_PATTERN,
  MAX_RECIPIENTS,
  MAX_SUBJECT_LENGTH,
  buildReplyContext,
  encodeBody,
  encodeMimeMessage,
  encodeUtf8Subject,
  extractAddress,
  parseRecipients,
  sanitizeMessageId,
  validateBody,
  validateSubject
};