// Vercel serverless function entry point
const app = require('./dist/server.js').default;

if (!app) {
  console.error('Failed to load Express app from dist/server.js');
  throw new Error('Server module not found');
}

module.exports = app;