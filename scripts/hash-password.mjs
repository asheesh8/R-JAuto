// Prints the hash for a new built-in admin password, ready to paste into
// ADMIN_PASSWORD_HASH in src/lib/store/index.ts. The plain password never goes
// in the repository, which is public.
//
//   npm run hash-password -- 'new password'
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run hash-password -- 'new password'");
  process.exit(1);
}
const iterations = 600_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
console.log(`pbkdf2-sha256$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`);
