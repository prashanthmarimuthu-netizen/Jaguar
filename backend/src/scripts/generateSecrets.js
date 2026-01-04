import crypto from 'crypto';

console.log('='.repeat(80));
console.log('GENERATE SECURE SECRETS FOR PRODUCTION');
console.log('='.repeat(80));
console.log('\nUse these secrets in your production environment variables:\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

console.log('JWT_SECRET=' + jwtSecret);
console.log('\nJWT_REFRESH_SECRET=' + jwtRefreshSecret);
console.log('\n' + '='.repeat(80));
console.log('⚠️  IMPORTANT: Keep these secrets secure! Never commit them to Git!');
console.log('='.repeat(80));

