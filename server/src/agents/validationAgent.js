function validateGeneratedReply(reply) { const text = String(reply || '').trim(); if (!text) { const error = new Error('The AI did not return a usable reply. Please try again.'); error.status = 502; throw error; } return { reply: text, validation: { suitableForReview: true, requiresUserReview: true } }; }
module.exports = { validateGeneratedReply };
