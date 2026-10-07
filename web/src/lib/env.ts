/** Server env with safe local defaults. Override in .env.local / Vercel. */
export const env = {
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/?replicaSet=rs0",
  mongoDb: process.env.MONGODB_DB ?? "kreo",
  appUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  isDev: process.env.NODE_ENV !== "production",
  /** Store magic links / OTPs in Mongo instead of sending them. Never enable on a public deploy. */
  devOutbox: process.env.NEXT_PUBLIC_DEV_OUTBOX === "1",
};
