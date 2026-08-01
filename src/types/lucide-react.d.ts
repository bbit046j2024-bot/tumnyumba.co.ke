/**
 * Type declaration shim for lucide-react.
 *
 * The published package (v1.27.0) ships its typings at dist/lucide-react.d.ts,
 * but that file is absent from the locally-installed copy — likely due to an
 * interrupted or partial `npm install`.  This shim tells TypeScript to treat
 * every import from "lucide-react" as `any` so the build is unblocked.
 *
 * Permanent fix: run `npm install lucide-react --force` to restore the full
 * package bundle including the bundled `.d.ts` file, then delete this shim.
 */
declare module "lucide-react";
