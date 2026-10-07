import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { magicLink, phoneNumber } from "better-auth/plugins";
import { db, devOutbox, mongoClient } from "@/lib/db/mongo";
import { env } from "@/lib/env";

async function deliver(channel: "email" | "sms", to: string, body: string, link?: string) {
  // TODO: plug in Resend (email) and an SMS provider (MSG91 / Twilio) for production.
  if (env.devOutbox) await devOutbox().insertOne({ channel, to, body, link, createdAt: new Date() });
  console.info(`[auth:${channel}] to=${to} ${body}`);
}

export const auth = betterAuth({
  database: mongodbAdapter(db, { client: mongoClient }),
  baseURL: env.appUrl,
  socialProviders:
    env.googleClientId && env.googleClientSecret
      ? { google: { clientId: env.googleClientId, clientSecret: env.googleClientSecret } }
      : undefined,
  plugins: [
    magicLink({
      sendMagicLink: ({ email, url }) => deliver("email", email, `Sign-in link: ${url}`, url),
    }),
    phoneNumber({
      sendOTP: ({ phoneNumber, code }) => deliver("sms", phoneNumber, `Your code is ${code}`),
      signUpOnVerification: {
        getTempEmail: (phone) => `${phone.replace(/\D/g, "")}@phone.local`,
        getTempName: (phone) => phone,
      },
    }),
    nextCookies(),
  ],
});
