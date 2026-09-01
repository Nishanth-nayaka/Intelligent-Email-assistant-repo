const allowedTypes = [
  'email_sent',
  'reply_sent',
  'summarized',
  'explained',
  'classified',
  'reply_generated',
  'archived',
  'deleted',
  'marked_read',
  'marked_unread',
  'starred',
  'unstarred'
];

function buildDescription({ activityType, subject = '', recipient = '', sender = '', category = '' }) {
  const cleanSubject = subject ? `"${subject}"` : 'email';
  switch (activityType) {
    case 'email_sent':
      return `Sent email to ${recipient || 'recipient'}: ${cleanSubject}`;
    case 'reply_sent':
      return `Sent reply regarding ${cleanSubject}`;
    case 'summarized':
      return `Generated AI summary for ${cleanSubject}`;
    case 'explained':
      return `Generated AI explanation for ${cleanSubject}`;
    case 'classified':
      return `Classified ${cleanSubject} as ${category || 'category'}`;
    case 'reply_generated':
      return `Drafted AI reply for ${cleanSubject}`;
    case 'archived':
      return `Archived ${cleanSubject}`;
    case 'deleted':
      return `Moved ${cleanSubject} to trash`;
    case 'marked_read':
      return `Marked ${cleanSubject} as read`;
    case 'marked_unread':
      return `Marked ${cleanSubject} as unread`;
    case 'starred':
      return `Starred ${cleanSubject}`;
    case 'unstarred':
      return `Unstarred ${cleanSubject}`;
    default:
      return `Action ${activityType} performed on ${cleanSubject}`;
  }
}

function formatActivityRecord({ activityType, emailId = null, subject = '', recipient = '', sender = '', category = '', metadata = {} }) {
  const type = allowedTypes.includes(activityType) ? activityType : 'other';
  const description = buildDescription({ activityType: type, subject, recipient, sender, category });

  return {
    emailId: emailId || null,
    activityType: type,
    description,
    metadata: {
      subject: subject || undefined,
      recipient: recipient || undefined,
      sender: sender || undefined,
      category: category || undefined,
      ...metadata
    }
  };
}

module.exports = {
  allowedTypes,
  buildDescription,
  formatActivityRecord
};
