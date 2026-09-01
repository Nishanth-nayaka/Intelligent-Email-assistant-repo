// Phase 5 focused checks (fully offline): MIME generation and encoding,
// UTF-8 subjects, To/CC/BCC validation, reply threading headers, and activity
// validation with exactly one awaited record per user action.
// Run with: npm run test:phase5 --prefix server

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// ---------------------------------------------------------------------------
// Module stubs (installed before the modules under test are required)
// ---------------------------------------------------------------------------
const supabaseConfig = require('../src/config/supabase');
let insertCalls = [];
let insertResult = { data: null, error: null };
let listResult = { data: [], error: null };
supabaseConfig.getSupabase = () => ({
  from() {
    return {
      insert(payload) {
        insertCalls.push(payload);
        return { select: () => ({ single: async () => insertResult }) };
      },
      select() {
        return {
          eq: () => ({ order: () => ({ range: async () => listResult }) })
        };
      }
    };
  }
});

const integrationService = require('../src/services/integrationService');
integrationService.getConnection = async () => ({ access_token: 'stub-access-token' });

const gmailIntegration = require('../src/integrations/gmailIntegration');
let gmailStub = {};
gmailIntegration.createGmailClient = () => gmailStub;

const activityService = require('../src/services/activityService');
const realRecordActivity = activityService.recordActivity;
const realListActivities = activityService.listActivities;

const gmailService = require('../src/services/gmailService');
const aiService = require('../src/services/aiService');
const monitoringAgent = require('../src/agents/monitoringAgent');
const mime = require('../src/utils/mime');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function decodeRaw(raw) {
  return Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function subjectEncodedWords(rawMessage) {
  const headerBlock = rawMessage.split('\r\n\r\n')[0];
  return headerBlock.match(/=\?utf-8\?B\?[A-Za-z0-9+/]+=*\?=/g) || [];
}

// RFC 2047 decoding: each encoded word decodes independently and the decoded
// output is concatenated in order.
function decodedSubject(rawMessage) {
  return subjectEncodedWords(rawMessage)
    .map((word) => Buffer.from(word.slice('=?utf-8?B?'.length, -2), 'base64').toString('utf8'))
    .join('');
}

// Replaces activityService.recordActivity with an async stub so tests can
// verify call counts and that gmailService awaits the insertion.
function stubActivityRecording(behavior) {
  const calls = [];
  let settled = false;
  activityService.recordActivity = async (userId, params) => {
    calls.push({ userId, params });
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (behavior && behavior.fail) throw Object.assign(new Error('Activity history is temporarily unavailable. Please try again.'), { status: 503 });
    settled = true;
    return { id: 'activity-1' };
  };
  return {
    calls,
    get settled() { return settled; },
    restore() { activityService.recordActivity = realRecordActivity; }
  };
}

// ---------------------------------------------------------------------------
// MIME generation and encoding
// ---------------------------------------------------------------------------
describe('MIME generation and encoding', () => {
  test('builds To/Cc/Bcc headers, UTF-8 subject and base64 body', () => {
    const raw = mime.encodeMimeMessage({
      to: 'first@example.com, second@example.co.uk',
      cc: 'cc@example.com',
      bcc: 'bcc@example.com',
      subject: 'Quarterly report',
      body: 'Line one\r\n\r\nLine two — with unicode ✓'
    });

    assert.equal(/^[A-Za-z0-9_-]+$/.test(raw), true, 'raw must be base64url');
    assert.equal(raw.endsWith('='), false, 'base64url padding must be stripped');

    const decoded = decodeRaw(raw);
    assert.ok(decoded.includes('To: first@example.com, second@example.co.uk'));
    assert.ok(decoded.includes('Cc: cc@example.com'));
    assert.ok(decoded.includes('Bcc: bcc@example.com'));
    assert.ok(decoded.startsWith('To: '));
    assert.ok(decoded.includes('MIME-Version: 1.0'));
    assert.ok(decoded.includes('Content-Type: text/plain; charset=utf-8'));
    assert.ok(decoded.includes('Content-Transfer-Encoding: base64'));
    assert.equal(decodedSubject(decoded), 'Quarterly report');

    const bodyPart = decoded.split('\r\n\r\n')[1];
    const decodedBody = Buffer.from(bodyPart.replace(/\r\n/g, ''), 'base64').toString('utf8');
    assert.equal(decodedBody, 'Line one\r\n\r\nLine two — with unicode ✓');
  });

  test('omits Cc/Bcc/In-Reply-To/References headers when not provided', () => {
    const decoded = decodeRaw(mime.encodeMimeMessage({ to: 'a@example.com', subject: 'Hi', body: 'x' }));
    assert.ok(!decoded.includes('Cc:'));
    assert.ok(!decoded.includes('Bcc:'));
    assert.ok(!decoded.includes('In-Reply-To:'));
    assert.ok(!decoded.includes('References:'));
  });

  test('encodes UTF-8 subjects (accents, CJK, emoji) round-trip', () => {
    const subject = 'Réunion — 次の会議 📧';
    const raw = mime.encodeMimeMessage({ to: 'a@example.com', subject, body: 'x' });
    assert.equal(decodedSubject(decodeRaw(raw)), subject);
  });

  test('folds long subjects into encoded words within the 75-char limit', () => {
    const subject = 'A'.repeat(250);
    const words = subjectEncodedWords(decodeRaw(mime.encodeMimeMessage({ to: 'a@example.com', subject, body: 'x' })));
    assert.ok(words.length > 1, 'long subject must be folded');
    words.forEach((word) => assert.ok(word.length <= 75, `encoded word too long: ${word.length}`));
    assert.equal(words.map((word) => Buffer.from(word.slice('=?utf-8?B?'.length, -2), 'base64').toString('utf8')).join(''), subject);
  });

  test('rejects subjects longer than 255 characters', () => {
    assert.throws(() => mime.encodeMimeMessage({ to: 'a@example.com', subject: 'x'.repeat(256), body: 'x' }), /255 characters or fewer/);
  });
});

// ---------------------------------------------------------------------------
// To/CC/BCC validation
// ---------------------------------------------------------------------------
describe('To/CC/BCC validation', () => {
  test('accepts and normalizes comma-separated valid addresses', () => {
    assert.equal(mime.parseRecipients(' a@example.com , b@example.co.uk ', 'To'), 'a@example.com, b@example.co.uk');
    assert.equal(mime.parseRecipients('a+b.tag@example.com', 'Cc'), 'a+b.tag@example.com');
  });

  test('rejects malformed addresses', () => {
    assert.throws(() => mime.parseRecipients('not-an-email', 'To'), /invalid email address/);
    assert.throws(() => mime.parseRecipients('a@example.com, broken@', 'To'), /invalid email address/);
    assert.throws(() => mime.parseRecipients('Jane Doe <jane@example.com>', 'To'), /invalid email address/);
  });

  test('rejects CR/LF header injection in recipients', () => {
    assert.throws(() => mime.parseRecipients('a@example.com\r\nBcc: hacker@evil.example', 'To'), /invalid control characters/);
    assert.throws(() => mime.parseRecipients('a@example.com\nBcc: hacker@evil.example', 'To'), /invalid control characters/);
  });

  test('rejects empty or control-character subjects', () => {
    assert.throws(() => mime.validateSubject('Hello\r\nBcc: hacker@evil.example'), /invalid control characters/);
    assert.throws(() => mime.validateSubject(''), /Subject is required/);
    assert.throws(() => mime.parseRecipients('', 'To'), /recipient is required/);
  });

  test('optional recipients return empty string and required ones throw', () => {
    assert.equal(mime.parseRecipients('', 'Cc', { required: false }), '');
    assert.equal(mime.parseRecipients(undefined, 'Bcc', { required: false }), '');
    assert.throws(() => mime.parseRecipients('', 'To'), /recipient is required/);
  });

  test('enforces the recipient limit', () => {
    const many = Array.from({ length: 51 }, (_, index) => `user${index}@example.com`).join(', ');
    assert.throws(() => mime.parseRecipients(many, 'To'), /at most 50 recipients/);
  });

  test('extractAddress handles display-name addresses', () => {
    assert.equal(mime.extractAddress('Jane Doe <jane@example.com>'), 'jane@example.com');
    assert.equal(mime.extractAddress('jane@example.com'), 'jane@example.com');
  });
});

// ---------------------------------------------------------------------------
// Reply threading headers
// ---------------------------------------------------------------------------
describe('Reply threading headers', () => {
  test('derives In-Reply-To, References and Re: subject from the parent', () => {
    const context = mime.buildReplyContext({
      parentMessageId: '<parent@mail.gmail.com>',
      parentSubject: 'Quarterly report',
      parentFrom: 'Jane Doe <jane@example.com>',
      existingReferences: '<older@mail.gmail.com>'
    });
    assert.equal(context.to, 'jane@example.com');
    assert.equal(context.subject, 'Re: Quarterly report');
    assert.equal(context.inReplyTo, '<parent@mail.gmail.com>');
    assert.equal(context.references, '<older@mail.gmail.com> <parent@mail.gmail.com>');
  });

  test('does not stack Re: prefixes and prefers Reply-To', () => {
    const context = mime.buildReplyContext({
      parentMessageId: '<p@x>',
      parentSubject: 'Re: Already answered',
      parentFrom: 'from@example.com',
      replyToAddress: 'support@vendor.example'
    });
    assert.equal(context.subject, 'Re: Already answered');
    assert.equal(context.to, 'support@vendor.example');
  });

  test('client-supplied recipient and subject overrides win when given', () => {
    const context = mime.buildReplyContext({
      parentMessageId: '<p@x>',
      parentSubject: 'Hi',
      parentFrom: 'from@example.com',
      requestedTo: 'override@example.com',
      requestedSubject: 'Custom subject'
    });
    assert.equal(context.to, 'override@example.com');
    assert.equal(context.subject, 'Custom subject');
  });

  test('rejects replies with no determinable recipient', () => {
    assert.throws(() => mime.buildReplyContext({ parentSubject: 'Hi' }), /Could not determine a reply recipient/);
  });
});

// ---------------------------------------------------------------------------
// Activity validation
// ---------------------------------------------------------------------------
describe('Activity validation', () => {
  test('formats known activity types with descriptions and metadata', () => {
    const formatted = monitoringAgent.formatActivityRecord({ activityType: 'email_sent', emailId: 'msg-1', subject: 'Hi', recipient: 'a@example.com' });
    assert.equal(formatted.activityType, 'email_sent');
    assert.equal(formatted.emailId, 'msg-1');
    assert.equal(formatted.description, 'Sent email to a@example.com: "Hi"');
    assert.equal(formatted.metadata.subject, 'Hi');
    assert.equal(formatted.metadata.recipient, 'a@example.com');
  });

  test('maps unknown activity types to the safe "other" type', () => {
    const formatted = monitoringAgent.formatActivityRecord({ activityType: 'unknown_type', emailId: 'msg-1' });
    assert.equal(formatted.activityType, 'other');
    assert.equal(formatted.description, 'Action other performed on email');
  });

  test('inserts exactly one row and returns the formatted record', async () => {
    insertCalls = [];
    insertResult = { data: { id: 'act-1', email_id: 'msg-1', activity_type: 'email_sent', description: 'Sent email to a@example.com: "Hi"', metadata: {}, created_at: '2026-01-01T00:00:00.000Z' }, error: null };
    const record = await realRecordActivity('user-1', { activityType: 'email_sent', emailId: 'msg-1', subject: 'Hi', recipient: 'a@example.com' });
    assert.equal(insertCalls.length, 1);
    assert.equal(insertCalls[0].user_id, 'user-1');
    assert.equal(insertCalls[0].activity_type, 'email_sent');
    assert.equal(insertCalls[0].email_id, 'msg-1');
    assert.equal(record.activityType, 'email_sent');
    assert.equal(record.id, 'act-1');
  });

  test('throws instead of silently dropping the record when the insert fails', async () => {
    insertResult = { data: null, error: { message: 'relation "email_activities" does not exist' } };
    await assert.rejects(() => realRecordActivity('user-1', { activityType: 'email_sent' }), /Activity history is temporarily unavailable/);
  });

  test('throws instead of returning an empty history when the query fails', async () => {
    listResult = { data: null, error: { message: 'connection refused' } };
    await assert.rejects(() => realListActivities('user-1'), /Could not load your activity history/);
  });

  test('maps stored rows into camelCase activities', async () => {
    listResult = { data: [{ id: 'a-1', email_id: 'msg-1', activity_type: 'reply_sent', description: 'Sent reply', metadata: { to: 'a@example.com' }, created_at: '2026-01-01T00:00:00.000Z' }], error: null };
    const result = await realListActivities('user-1', { limit: 10, offset: 0 });
    assert.equal(result.activities.length, 1);
    assert.equal(result.activities[0].activityType, 'reply_sent');
    assert.equal(result.activities[0].emailId, 'msg-1');
    assert.equal(result.activities[0].metadata.to, 'a@example.com');
  });

  test('requires an authenticated user id', async () => {
    await assert.rejects(() => realRecordActivity('', { activityType: 'email_sent' }), /authenticated user id/);
  });
});

// ---------------------------------------------------------------------------
// Exactly one awaited activity record per user action
// ---------------------------------------------------------------------------
const parentMessage = {
  id: 'parent-1',
  threadId: 'thread-9',
  payload: {
    headers: [
      { name: 'From', value: 'Jane Doe <jane@example.com>' },
      { name: 'Reply-To', value: 'no-reply@vendor.example' },
      { name: 'To', value: 'me@example.com' },
      { name: 'Subject', value: 'Quarterly report' },
      { name: 'Message-ID', value: '<parent-1@mail.gmail.com>' },
      { name: 'References', value: '<older-1@mail.gmail.com>' }
    ]
  }
};

function installGmailStub() {
  const sendRequests = [];
  const modifyRequests = [];
  const trashRequests = [];
  gmailStub = {
    users: {
      messages: {
        send: async (request) => { sendRequests.push(request); return { data: { id: 'new-message-1', threadId: 'thread-9' } }; },
        modify: async (request) => { modifyRequests.push(request); return { data: {} }; },
        trash: async (request) => { trashRequests.push(request); return { data: {} }; },
        get: async () => ({ data: parentMessage })
      }
    }
  };
  return { sendRequests, modifyRequests, trashRequests };
}

describe('Exactly one awaited activity record per user action', () => {
  test('send() records exactly one awaited email_sent activity', async () => {
    const stub = stubActivityRecording();
    const { sendRequests } = installGmailStub();
    try {
      const result = await gmailService.send('user-1', { to: 'first@example.com', subject: 'Hello', body: 'Body' });
      assert.equal(stub.calls.length, 1, 'exactly one activity record');
      assert.equal(stub.calls[0].params.activityType, 'email_sent');
      assert.equal(stub.settled, true, 'insertion must be awaited before responding');
      assert.equal(result.activityLogged, true);
      assert.equal(result.warning, undefined);
      const decoded = decodeRaw(sendRequests[0].requestBody.raw);
      assert.ok(decoded.includes('To: first@example.com'));
      assert.equal(decodedSubject(decoded), 'Hello');
    } finally {
      stub.restore();
    }
  });

  test('send() still succeeds with an explicit warning when logging fails', async () => {
    const stub = stubActivityRecording({ fail: true });
    installGmailStub();
    try {
      const result = await gmailService.send('user-1', { to: 'first@example.com', subject: 'Hello', body: 'Body' });
      assert.equal(result.success, true, 'the Gmail send already happened');
      assert.equal(result.activityLogged, false);
      assert.match(result.warning, /activity history/i);
      assert.equal(stub.calls.length, 1);
    } finally {
      stub.restore();
    }
  });

  test('reply() records one reply_sent activity and threads via headers + threadId', async () => {
    const stub = stubActivityRecording();
    const { sendRequests } = installGmailStub();
    try {
      const result = await gmailService.reply('user-1', 'parent-1', { body: 'Here is my reply.' });
      assert.equal(stub.calls.length, 1, 'exactly one activity record');
      assert.equal(stub.calls[0].params.activityType, 'reply_sent');
      assert.equal(stub.settled, true, 'insertion must be awaited before responding');
      assert.equal(result.threadId, 'thread-9');
      assert.equal(sendRequests[0].requestBody.threadId, 'thread-9');

      const decoded = decodeRaw(sendRequests[0].requestBody.raw);
      assert.ok(decoded.includes('In-Reply-To: <parent-1@mail.gmail.com>'));
      assert.ok(decoded.includes('References: <older-1@mail.gmail.com> <parent-1@mail.gmail.com>'));
      assert.ok(decoded.includes('To: no-reply@vendor.example'));
      assert.equal(decodedSubject(decoded), 'Re: Quarterly report');
      assert.equal(stub.calls[0].params.metadata.threadId, 'thread-9');
    } finally {
      stub.restore();
    }
  });

  test('modify() records exactly one awaited activity per label change', async () => {
    const stub = stubActivityRecording();
    const { modifyRequests } = installGmailStub();
    try {
      await gmailService.modify('user-1', 'msg-1', ['STARRED'], []);
      assert.equal(stub.calls.length, 1);
      assert.equal(stub.calls[0].params.activityType, 'starred');
      assert.equal(stub.settled, true);

      await gmailService.modify('user-1', 'msg-1', [], ['INBOX']);
      assert.equal(stub.calls.length, 2);
      assert.equal(stub.calls[1].params.activityType, 'archived');
      assert.equal(modifyRequests.length, 2);
    } finally {
      stub.restore();
    }
  });

  test('remove() records exactly one awaited deleted activity', async () => {
    const stub = stubActivityRecording();
    const { trashRequests } = installGmailStub();
    try {
      const result = await gmailService.remove('user-1', 'msg-1');
      assert.equal(trashRequests.length, 1);
      assert.equal(stub.calls.length, 1);
      assert.equal(stub.calls[0].params.activityType, 'deleted');
      assert.equal(stub.settled, true);
      assert.equal(result.activityLogged, true);
    } finally {
      stub.restore();
    }
  });
});

// ---------------------------------------------------------------------------
// Gemini reliability (bounded timeout, clean 503 handling, single short retry)
// ---------------------------------------------------------------------------
describe('Gemini reliability', () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { key: process.env.GEMINI_API_KEY, timeout: process.env.GEMINI_TIMEOUT_MS };

  function installFetchStub(handler) {
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      return handler(calls.length, url, options);
    };
    return calls;
  }

  function geminiOk(text) {
    return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) };
  }

  function geminiStatus(status) {
    return { ok: false, status, json: async () => ({ error: { message: 'high demand' } }) };
  }

  function restore() {
    globalThis.fetch = originalFetch;
    if (originalEnv.key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalEnv.key;
    if (originalEnv.timeout === undefined) delete process.env.GEMINI_TIMEOUT_MS;
    else process.env.GEMINI_TIMEOUT_MS = originalEnv.timeout;
  }

  test('bounds each attempt and fails fast with the AI-unavailable 503', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.GEMINI_TIMEOUT_MS = '50';
    const calls = installFetchStub((attempt, url, options) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(geminiOk('too late')), 5000);
      options.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(options.signal.reason);
      });
    }));
    try {
      const startedAt = Date.now();
      await assert.rejects(() => aiService.generate('hello'), /Unable to reach the AI service/);
      assert.ok(Date.now() - startedAt < 4000, 'a stalled Gemini connection must not hang for minutes');
      assert.equal(calls.length, 1, 'timeouts are not retried');
      assert.ok(calls[0].options.signal instanceof AbortSignal, 'fetch must carry an abort signal');
      assert.equal(calls[0].options.signal.aborted, true);
    } finally {
      restore();
    }
  });

  test('retries a Gemini 503 exactly once and succeeds', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const calls = installFetchStub((attempt) => (attempt === 1 ? geminiStatus(503) : geminiOk('recovered reply')));
    try {
      const startedAt = Date.now();
      const text = await aiService.generate('hello');
      assert.equal(text, 'recovered reply');
      assert.equal(calls.length, 2, 'exactly one retry');
      assert.ok(Date.now() - startedAt >= 900, 'the retry waits for the short delay');
      assert.ok(Date.now() - startedAt < 4000, 'the retry stays short');
    } finally {
      restore();
    }
  });

  test('does not loop: a second 503 returns the clean AI-unavailable response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const calls = installFetchStub(() => geminiStatus(503));
    try {
      await assert.rejects(
        () => aiService.generate('hello'),
        (error) => error.status === 503 && /temporarily busy/.test(error.message)
      );
      assert.equal(calls.length, 2, 'at most one retry, never a loop');
    } finally {
      restore();
    }
  });

  test('non-retryable Gemini errors are not retried', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const calls = installFetchStub(() => geminiStatus(400));
    try {
      await assert.rejects(
        () => aiService.generate('hello'),
        (error) => error.status === 502 && /AI generation failed/.test(error.message)
      );
      assert.equal(calls.length, 1);
    } finally {
      restore();
    }
  });
});