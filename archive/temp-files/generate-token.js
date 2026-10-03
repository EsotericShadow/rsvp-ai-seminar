const crypto = require('crypto');

const username = "RandomPanda";
const secret = requireAuditEnvironment('ADMIN_SESSION_SECRET');
const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

const payload = `${username}:${expiresAt}`;
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
const token = `${payload}:${signature}`;

console.log(token);


// Require an operator-supplied credential without embedding it in source.
function requireAuditEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
