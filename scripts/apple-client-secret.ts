// Prints an APPLE_CLIENT_SECRET JWT, for debugging. The app signs its own on startup.

import { createAppleClientSecret } from "@/lib/apple";
import { readFileSync } from "node:fs";

const TEAM_ID = "W77BHZR96V";
const CLIENT_ID = "cc.cowleyroadcondors.ride.si";

const [keyPath, keyId] = process.argv.slice(2);
if (!keyPath || !keyId) {
  console.error("Usage: tsx scripts/apple-client-secret.ts <path-to-AuthKey.p8> <key-id>");
  process.exit(1);
}

const { secret, expiresAt } = createAppleClientSecret({
  privateKey: readFileSync(keyPath, "utf8"),
  keyId,
  teamId: TEAM_ID,
  clientId: CLIENT_ID,
});

console.error(`expires: ${expiresAt.toISOString()}`);
console.log(secret);
