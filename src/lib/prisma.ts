/**
 * Prisma Client singleton.
 *
 * Key production behaviours enforced here:
 *
 * 1. SINGLETON PATTERN — Next.js hot-reload in development creates new
 *    PrismaClient instances on every module reload. Storing the instance on
 *    `globalThis` prevents connection pool exhaustion during local dev.
 *
 * 2. CONDITIONAL LOGGING — Only `warn` and `error` are logged in all
 *    environments to avoid I/O overhead from verbose query logging.
 *
 * 3. CONNECTION POOLING — connection_limit is set via Prisma schema's
 *    datasource url parameter (@@index blocks), NOT the URL string, because
 *    TiDB Cloud uses MySQL protocol which does not support PgBouncer-style
 *    query params. The in-process cache in src/lib/cache.ts significantly
 *    reduces how often the pool is hit for hot endpoints (notifications, stats).
 */

import { PrismaClient } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: isProduction
      ? ["warn", "error"]   // production: only warnings and errors
      : ["warn", "error"],  // dev: removed "query" to reduce noise
  });
}

export const prisma = globalForPrisma.prisma ?? buildPrismaClient();

// Only cache the instance on globalThis during development.
// In production each invocation always uses the module-level singleton,
// which is the correct behaviour for long-running Node.js servers.
if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
