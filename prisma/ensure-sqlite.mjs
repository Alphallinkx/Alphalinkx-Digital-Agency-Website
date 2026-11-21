import 'dotenv/config';
import { openSync, closeSync } from 'node:fs';

const url = process.env.DATABASE_URL;
if (!url?.startsWith('file:') || !url.slice(5) || url.slice(5) === ':memory:') {
  throw new Error('DATABASE_URL must point to a writable SQLite database file.');
}

// Prisma's migration engine expects the SQLite file to exist on some platforms.
try {
  closeSync(openSync(url.slice(5), 'wx', 0o600));
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
