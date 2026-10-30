import dotenv from "dotenv";

dotenv.config({ quiet: true });

// Refuse to start with missing credentials. Never include values in errors.
export function requireEnv(name, env = process.env) {
  const value = env[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = Object.freeze({
  db: Object.freeze({
    host: requireEnv("DB_HOST"),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
  }),
  geminiApiKey: requireEnv("GEMINI_API_KEY"),
});
