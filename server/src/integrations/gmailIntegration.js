const { google } = require('googleapis');
const { requireGoogleConfig } = require('../config/env');

const scopes = ['https://www.googleapis.com/auth/gmail.modify'];

function createOAuthClient() {
  requireGoogleConfig();
  return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
}

function createGmailClient(tokens) {
  const auth = createOAuthClient();
  auth.setCredentials(tokens);
  return google.gmail({ version: 'v1', auth });
}

module.exports = { createOAuthClient, createGmailClient, scopes };
