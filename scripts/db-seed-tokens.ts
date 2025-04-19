import { db, schema } from "@/db";
import { encrypt } from "@/lib/encryption";

async function insertTokens() {
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN!;
  await db.insert(schema.token).values({
    site: "strava",
    accessToken: encrypt("foobar"),
    expiresAt: new Date(),
    refreshToken: encrypt(refreshToken),
  });

  console.log("Tokens inserted successfully!");
  process.exit(0);
}

insertTokens();
