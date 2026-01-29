const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const optionalEnv = (name: string): string | undefined => process.env[name];

const resolveAppUrl = (): string => {
  // Highest priority: explicit override
  const explicit = optionalEnv("NEXT_PUBLIC_APP_URL");
  if (explicit) return explicit.replace(/\/+$/, "");

  // Vercel provides VERCEL_URL without protocol
  const vercelUrl = optionalEnv("VERCEL_URL");
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/+$/, "");

  // Local/dev fallback
  return "http://localhost:3000";
};

export const env = {
  TELEGRAM_BOT_TOKEN: requireEnv("TELEGRAM_BOT_TOKEN"),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: requireEnv(
    "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME"
  ),
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireEnv("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  // Back-compat: keep the field but don't force it.
  NEXT_PUBLIC_APP_URL: resolveAppUrl(),
  // Preferred name going forward
  APP_URL: resolveAppUrl(),
  TELEGRAM_AUTH_TOKEN: requireEnv("TELEGRAM_AUTH_TOKEN"),
  AUTH_JWT_SECRET: requireEnv("AUTH_JWT_SECRET"),
  GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),
};
