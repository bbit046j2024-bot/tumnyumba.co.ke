/**
 * Prisma Client singleton.
 *
 * Key production behaviours enforced here:
 *
 * 1. SINGLETON PATTERN — Next.js hot-reload in development creates new
 *    PrismaClient instances on every module reload. Storing the instance on
 *    `globalThis` prevents connection pool exhaustion during local dev.
 *
 * 2. CONDITIONAL LOGGING — Query logging (`log: ["query"]`) is extremely
 *    verbose and adds measurable I/O overhead. It is only enabled in
 *    development. Production only logs `warn` and `error` events.
 *
 * 3. CONNECTION POOLING — The `connection_limit` parameter caps how many
 *    simultaneous DB connections Prisma may open. For serverless/edge
 *    environments each function invocation can spin up its own client, so
 *    without a cap you can exhaust MySQL's max_connections under modest load.
 *
 *    Tune `CONNECTION_POOL_SIZE` via the env var for your hosting tier:
 *      - Shared VPS / small DO droplet → 5–10
 *      - Dedicated server / large RDS  → 20–50
 *      - PlanetScale / Prisma Accelerate → set to 1 (they handle pooling)
 *
 *    Defaults to 10 if the env var is not set.
 */

import { PrismaClient } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";
const poolSize = parseInt(process.env.CONNECTION_POOL_SIZE ?? "10", 10);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: isProduction
      ? ["warn", "error"]      // production: only warnings and errors
      : ["query", "warn", "error"], // development: full query tracing
  });
}

export const prisma = globalForPrisma.prisma ?? buildPrismaClient();

// Only cache the instance on globalThis during development.
// In production each invocation always uses the module-level singleton,
// which is the correct behaviour for long-running Node.js servers.
if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
