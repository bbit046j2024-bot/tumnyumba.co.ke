import { handlers } from "@/lib/auth";

// Auth endpoints must always be dynamic — never statically rendered or cached.
// Without this, Turbopack can serve a stale HTML page instead of JSON during
// the initial compilation pass, causing ClientFetchError on the client.
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;

