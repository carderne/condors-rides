// Sign in with Apple needs a client secret that's a JWT signed with the .p8 key.
// Apple caps these at 6 months, so we sign a fresh one on startup rather than
// storing one that silently expires.
// https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret

import { createPrivateKey, sign } from "node:crypto";

const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export function createAppleClientSecret({
  privateKey,
  keyId,
  teamId,
  clientId,
}: {
  privateKey: string;
  keyId: string;
  teamId: string;
  clientId: string;
}): { secret: string; expiresAt: Date } {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + MAX_AGE_SECONDS;

  const b64url = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const header = b64url({ alg: "ES256", kid: keyId });
  const payload = b64url({
    iss: teamId,
    sub: clientId,
    aud: "https://appleid.apple.com",
    iat: now,
    exp,
  });

  // ieee-p1363 gives the raw r||s signature that JWS ES256 expects (not DER)
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), {
    // env vars often store the PEM with literal \n
    key: createPrivateKey(privateKey.replaceAll("\\n", "\n")),
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");

  return { secret: `${header}.${payload}.${signature}`, expiresAt: new Date(exp * 1000) };
}
