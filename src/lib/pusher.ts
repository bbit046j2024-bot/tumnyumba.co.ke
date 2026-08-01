/**
 * Pusher server/client singletons.
 *
 * All credentials MUST be supplied via environment variables.
 * No fallback strings are intentionally provided — a missing env var should
 * fail loudly at startup rather than silently reuse a development key in
 * production.
 *
 * Required env vars:
 *   PUSHER_APP_ID          — server only
 *   PUSHER_KEY             — server only
 *   PUSHER_SECRET          — server only
 *   PUSHER_CLUSTER         — server only
 *   NEXT_PUBLIC_PUSHER_KEY     — exposed to browser
 *   NEXT_PUBLIC_PUSHER_CLUSTER — exposed to browser
 */

import PusherServer from "pusher";
import PusherClient from "pusher-js";

// ── Guard: catch misconfigured deployments at startup ────────────────────────
const requiredServerVars = [
  "PUSHER_APP_ID",
  "PUSHER_KEY",
  "PUSHER_SECRET",
  "PUSHER_CLUSTER",
] as const;

for (const key of requiredServerVars) {
  if (typeof window === "undefined" && !process.env[key]) {
    throw new Error(
      `[pusher] Missing required environment variable: ${key}. ` +
        "Add it to your .env file (local) or deployment secrets (production)."
    );
  }
}

// ── Server-side Pusher instance (triggers events to clients) ─────────────────
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// ── Client-side Pusher instance (subscribes to events in browser) ────────────
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
