import { getConfig } from "@/lib/config";
import crypto from "crypto";

const {
  baseUrl,
  firebase: { projectId, serviceAccountB64 },
} = getConfig();

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function base64url(input: string, isBase64 = false): string {
  const buf = isBase64 ? Buffer.from(input, "base64") : Buffer.from(input);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function createJWT(serviceAccount: ServiceAccount): string {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signatureInput)
    .sign(serviceAccount.private_key, "base64");

  return `${signatureInput}.${base64url(signature, true)}`;
}

async function getAccessToken(): Promise<string> {
  const serviceAccountJson = Buffer.from(serviceAccountB64, "base64").toString("utf-8");
  const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);

  const jwt = createJWT(serviceAccount);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

export class Firebase {
  accessToken: string | undefined;

  async auth() {
    this.accessToken = await getAccessToken();
  }

  async sendNotification({
    token,
    title,
    body,
    slug,
  }: {
    token: string;
    title: string;
    body: string;
    slug: string;
  }) {
    if (this.accessToken === undefined) {
      await this.auth();
    }

    const url = new URL(`/rides/${slug}`, baseUrl).toString();

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title,
              body,
            },
            data: {
              url,
            },
            android: {
              priority: "normal",
            },
            apns: {
              headers: {
                "apns-priority": "5",
              },
            },
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${await response.text()}`);
    }

    return response.json();
  }
}
