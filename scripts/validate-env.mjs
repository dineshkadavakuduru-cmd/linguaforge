// Fails the production/preview build when a required environment variable is
// missing. Local development builds only warn, so `next build` still works on a
// machine without secrets. Opt into strict local checks with
// ENFORCE_ENV_VALIDATION=1.
//
// Vercel sets VERCEL_ENV to "production" | "preview" | "development".

const vercelEnv = process.env.VERCEL_ENV;
const isProduction = vercelEnv === "production";
const isPreview = vercelEnv === "preview";
const enforce = isProduction || isPreview || process.env.ENFORCE_ENV_VALIDATION === "1";

const publicFirebase = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

// Server-only secrets: required anywhere the app actually serves traffic.
const serverSecrets = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
  "OPENROUTER_API_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const missing = [];
for (const key of publicFirebase) {
  if (!process.env[key]?.trim()) missing.push({ key, scope: "all environments" });
}
if (isProduction || isPreview) {
  for (const key of serverSecrets) {
    if (!process.env[key]?.trim()) missing.push({ key, scope: vercelEnv });
  }
}

if (missing.length === 0) {
  console.log(`[env] Validated required environment variables for "${vercelEnv ?? "local"}".`);
  process.exit(0);
}

const detail = missing.map(({ key, scope }) => `  - ${key} (${scope})`).join("\n");
const report = `[env] Missing required environment variables:\n${detail}`;

if (enforce) {
  console.error(`\n${report}\n`);
  console.error(`[env] Refusing to build a ${vercelEnv ?? "validated"} deployment with missing configuration.`);
  process.exit(1);
}

console.warn(`\n${report}\n`);
console.warn("[env] Not a production/preview build — continuing. Set ENFORCE_ENV_VALIDATION=1 to fail instead.\n");
