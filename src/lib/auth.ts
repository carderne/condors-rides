import { db, schema } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { getConfig } from "./config";
import { invariant } from "./invariant";

const config = getConfig();

export const auth = betterAuth({
  trustedOrigins: [config.baseUrl],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: config.google,
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  session: {
    cookieCache: {
      // gives issues with ensuring that an active org id is set
      enabled: false,
      maxAge: 5 * 60, // Cache duration in seconds
    },
    additionalFields: {
      activeOrganizationId: {
        type: "string",
        required: false,
        input: false,
      },
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
          if (user.deactivatedAt) {
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
    generateId: false, // nanoid generation controlled in db/schema.ts
  },
});
