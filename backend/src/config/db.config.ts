import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// On shared hosting MySQL connections are a scarce resource.
// connection_limit=5 keeps the pool small so we don't exhaust the
// host's per-user connection quota (usually 10–25 on shared plans).
// The DATABASE_URL in .env.production should already be URL-encoded,
// so we append the param only when it isn't already set.
function buildDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || '';
  if (url.includes('connection_limit')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}connection_limit=5&pool_timeout=10`;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
