import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getConfig } from "./config";

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
  plugins: [
    nextCookies(), // make sure this is the last plugin in the array
  ],
  advanced: {
    cookiePrefix: "condors-app",
    generateId: false, // nanoid generation controlled in db/schema.ts
  },
});
