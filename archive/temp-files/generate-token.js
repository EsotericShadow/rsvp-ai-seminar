const crypto = require('crypto');

const username = "RandomPanda";
const secret = "REDACTED_CREDENTIAL";
const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

const payload = `${username}:${expiresAt}`;
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
const token = `${payload}:${signature}`;

console.log(token);
