const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

// Load client secrets from a local file.
const credentials = require('./credentials.json');

const client = new OAuth2Client(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

// Authorize the client with the Gmail API.
async function authorize() {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.labels', 'https://www.googleapis.com/auth/gmail.send'],
  });

  console.log(`Authorize this app by visiting this URL: ${authUrl}`);

  const code = ''; // Enter the authorization code you obtained from the URL
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
}

authorize();

const gmail = google.gmail({ version: 'v1', auth: client });

async function fetchEmails() {
  const res = await gmail.users.messages.list({ userId: 'me' });
  const emails = res.data.messages;
  console.log(`Fetched ${emails.length} emails`);
}

fetchEmails();

async function hasReplies(threadId) {
    const res = await gmail.users.threads.get({ userId: 'me', id: threadId });
    const messages = res.data.messages;
    return messages.length > 1;
  }
  
  async function filterEmails(emails) {
    const filteredEmails = [];
  
    for (const email of emails) {
      const threadId = email.threadId;
      const replied = await hasReplies(threadId);
  
      if (!replied) {
        filteredEmails.push(email);
      }
    }
  
    console.log(`Filtered ${emails.length - filteredEmails.length} emails`);
    return filteredEmails;
  }
  