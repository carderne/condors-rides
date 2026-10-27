import { db, schema } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { createAppleClientSecret } from "./apple";
import { getConfig } from "./config";
import { invariant } from "./invariant";

const config = getConfig();

// Signed once per process when this module loads. Skipped when the key is empty,
// i.e. in tests with NO_CHECK_ENV_VARS=1.
const appleClientSecret = config.apple.privateKey
  ? createAppleClientSecret(config.apple).secret
  : "";

export const auth = betterAuth({
  trustedOrigins: [config.baseUrl, "https://appleid.apple.com"],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 21,
  },
  emailAndPassword: {
    enabled: config.emailAndPasswordEnabled,
  },
  socialProviders: {
    google: config.google,
    facebook: config.facebook,
    apple: {
      clientId: config.apple.clientId,
      clientSecret: appleClientSecret,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await db.query.user.findFirst({
            where: eq(schema.user.id, session.userId),
          });
          invariant(user, "session with no user");
          if (user.deletedAt) {
            return false;
          }

          return { data: session };
        },
      },
    },
  },
  plugins: [
    nextCookies(), // make sure this is the last plugin in the array
  ],
  advanced: {
    cookiePrefix: "condors-app",
    database: {
      generateId: false, // nanoid generation controlled in db/schema.ts
    },
  },
});
