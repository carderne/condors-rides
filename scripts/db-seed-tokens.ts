import { db, schema } from "@/db";
import { encrypt } from "@/lib/encryption";

async function insertTokens() {
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN!;
  const values = {
    site: "strava" as const,
    accessToken: encrypt("foobar"),
    expiresAt: new Date(),
    refreshToken: encrypt(refreshToken),
  };
  await db
    .insert(schema.token)
    .values(values)
    .onConflictDoUpdate({ target: schema.token.site, set: values });

  console.log("Tokens inserted successfully!");
  process.exit(0);
}

insertTokens();
