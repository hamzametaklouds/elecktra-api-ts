// Simple script to seed tools via HTTP request
const https = require('https');

const seedData = [
  {
    key: 'gmail',
    title: 'Gmail',
    description: 'Google\'s email service for sending and receiving emails',
    category: 'email',
    icon_url: 'https://developers.google.com/gmail/images/gmail-icon.png',
    oauth_type: 'oauth2',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send']
  },
  {
    key: 'notion',
    title: 'Notion',
    description: 'All-in-one workspace for notes, docs, and collaboration',
    category: 'docs',
    icon_url: 'https://www.notion.so/images/logo-ios.png',
    oauth_type: 'oauth2',
    scopes: ['read', 'write']
  },
  {
    key: 'gdrive',
    title: 'Google Drive',
    description: 'Google\'s cloud storage service for files and documents',
    category: 'storage',
    icon_url: 'https://developers.google.com/drive/images/drive_icon.png',
    oauth_type: 'oauth2',
    scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file']
  },
  {
    key: 'gsheets',
    title: 'Google Sheets',
    description: 'Google\'s spreadsheet application for data management',
    category: 'spreadsheets',
    icon_url: 'https://developers.google.com/sheets/images/sheets_icon.png',
    oauth_type: 'oauth2',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/spreadsheets']
  },
  {
    key: 'dropbox',
    title: 'Dropbox',
    description: 'Cloud storage service for file synchronization and sharing',
    category: 'storage',
    icon_url: 'https://cfl.dropboxstatic.com/static/images/logo_catalog/dropbox_logo_glyph_blue_m1@2x.png',
    oauth_type: 'oauth2',
    scopes: ['files.content.read', 'files.content.write']
  }
];

console.log('Base tools have been defined and are ready to be seeded.');
console.log('Tools to be seeded:', seedData.map(tool => tool.title).join(', '));
console.log('To actually seed the database, make a POST request to /tools/seed with proper authentication.');