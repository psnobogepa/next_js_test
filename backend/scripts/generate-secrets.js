const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('\n=== Generated Secrets for Strapi .env file ===\n');
console.log('APP_KEYS=' + generateSecret());
console.log('ADMIN_JWT_SECRET=' + generateSecret());
console.log('API_TOKEN_SALT=' + generateSecret());
console.log('TRANSFER_TOKEN_SALT=' + generateSecret());
console.log('JWT_SECRET=' + generateSecret());
console.log('\n=== Copy these values to your backend/.env file ===\n');

