import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as typeof globalThis & { alphalinkxPrisma?: PrismaClient };

export function getPrisma(): PrismaClient;
export function getPrisma(connect: false): PrismaClient | undefined;
export function getPrisma(connect = true) {
  if (!connect) return globalForPrisma.alphalinkxPrisma;

  if (!globalForPrisma.alphalinkxPrisma) {
    const url = process.env.DATABASE_URL;
    if (!url?.startsWith('file:') || !url.slice(5)) {
      throw new Error('DATABASE_URL must point to a SQLite database file.');
    }

    const adapter = new PrismaBetterSqlite3({ url }, { timestampFormat: 'unixepoch-ms' });
    globalForPrisma.alphalinkxPrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.alphalinkxPrisma;
}
