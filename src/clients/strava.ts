import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { decrypt, encrypt } from "@/lib/encryption";
import { invariant } from "@/lib/invariant";
import type { Result } from "@/types/result";
import { addMinutes, isAfter } from "date-fns";
import { eq } from "drizzle-orm";
import type { IncomingMessage } from "http";
import https from "https";
import { URL } from "url";

const {
  strava: { clientId, clientSecret },
} = getConfig();

interface StravaRoute {
  // https://developers.strava.com/docs/reference/#api-Routes-getRouteById
  name: string;
  map: { summary_polyline: string; polyline: string };
}

type StravaResponse<T> = Result<T, string>;

export async function getStravaRoute(routeId: string): Promise<StravaResponse<StravaRoute>> {
  const accessToken = await getAccessToken();
  if (!accessToken.ok) {
    return accessToken;
  }

  const response = await fetch(`https://www.strava.com/api/v3/routes/${routeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.data}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Strava get route failed", data);
    return { ok: false, error: "Strava request failed" };
  }

  return { ok: true, data: data as StravaRoute };
}

interface StravaAccessToken {
  token_type: "Bearer";
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

async function getAccessToken(): Promise<StravaResponse<string>> {
  const result = await db.transaction(async (tx): Promise<StravaResponse<string>> => {
    const [auth] = await tx.select().from(schema.token).where(eq(schema.token.site, "strava"));
    invariant(auth, "no strava auth details in db");
    const accessToken = decrypt(auth.accessToken);

    // Token is still valid, return it
    if (isAfter(auth.expiresAt, addMinutes(new Date(), 5))) {
      return { ok: true, data: accessToken };
    }

    // We need to use the refresh token to get a new access token
    const refreshToken = decrypt(auth.refreshToken);
    const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Strava get access token failed", data);
      return { ok: false, error: "Get new access token failed" };
    }
    const res = data as StravaAccessToken;
    const newAccessToken = encrypt(res.access_token);
    const newRefreshToken = encrypt(res.refresh_token);

    await db
      .update(schema.token)
      .set({
        accessToken: newAccessToken,
        expiresAt: new Date(res.expires_at * 1000),
        refreshToken: newRefreshToken,
      })
      .where(eq(schema.token.site, "strava"));
    return { ok: true, data: res.access_token };
  });
  return result;
}

export async function followStravaShortLink(url: string): Promise<string | undefined> {
  const parsedUrl = new URL(url);
  const options = { method: "HEAD", headers: { "User-Agent": "curl/7.79.1" } };

  const response = await new Promise<IncomingMessage>((resolve, reject) => {
    const req = https.request(parsedUrl, options, (res) => {
      resolve(res);
      res.resume(); // Don't read the body for HEAD request
    });
    req.on("error", reject);
    req.end();
  });

  const location = response.headers.location;
  return location;
}
