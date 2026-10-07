import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { anonymous, magicLink, phoneNumber } from "better-auth/plugins";
import { businesses, credits, ideas } from "@/lib/db/models";
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
    // Guests get a real session instantly; signing in later keeps their data.
    anonymous({
      emailDomainName: "guest.local",
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const from = anonymousUser.user.id;
        const to = newUser.user.id;
        const hasOwn = await businesses().findOne({ userId: to });
        if (!hasOwn) await businesses().updateOne({ userId: from }, { $set: { userId: to } });
        await ideas().updateMany({ userId: from }, { $set: { userId: to } });
        await credits().updateMany({ userId: from }, { $set: { userId: to } });
      },
    }),
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
