const crypto = require('crypto');

const username = "RandomPanda";
const secret = "1d4e0c6959d70efb709becdf5c3fee8d84a2cd6f3e704805e35c132baeef08e6";
const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

const payload = `${username}:${expiresAt}`;
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
const token = `${payload}:${signature}`;

console.log(token);
