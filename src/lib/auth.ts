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
    enabled: false,
  },
  socialProviders: {
    google: config.google,
    facebook: config.facebook,
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
          if (user.deactivatedAt) {
            return false;
          }

          return { data: session };
        },
      },
    },
  },
  plugins: [
    // genericOAuth({
    //   config: [
    //     {
    //       providerId: "strava",
    //       clientId: config.strava.clientId,
    //       clientSecret: config.strava.clientSecret,
    //       authorizationUrl: "https://www.strava.com/oauth/authorize",
    //       tokenUrl: "https://www.strava.com/oauth/token",
    //       accessType: "authorization",
    //       scopes: ["read,activity:read"],
    //     },
    //   ],
    // }),
    nextCookies(), // make sure this is the last plugin in the array
  ],
  advanced: {
    cookiePrefix: "condors-app",
    generateId: false, // nanoid generation controlled in db/schema.ts
  },
});
