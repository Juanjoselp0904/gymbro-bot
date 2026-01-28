const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

export const env = {
  TELEGRAM_BOT_TOKEN: requireEnv("TELEGRAM_BOT_TOKEN"),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: requireEnv(
    "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME"
  ),
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireEnv("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  NEXT_PUBLIC_APP_URL: requireEnv("NEXT_PUBLIC_APP_URL"),
  TELEGRAM_AUTH_TOKEN: requireEnv("TELEGRAM_AUTH_TOKEN"),
  AUTH_JWT_SECRET: requireEnv("AUTH_JWT_SECRET"),
  GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),
};
