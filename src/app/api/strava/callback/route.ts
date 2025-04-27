import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { invariant } from "@/lib/invariant";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";

const config = getConfig();

interface StravaError {
  message?: string;
  errors?: { resource: string; field: string; code: string }[];
}

interface StravaSuccess {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: {
    id: number;
    username: null;
    resource_state: number;
    firstname: string;
    lastname: string;
    bio: null;
    city: string;
    state: string;
    country: string;
    sex: string;
    premium: boolean;
    summit: boolean;
    created_at: string;
    updated_at: string;
    badge_type_id: number;
    weight: number;
    profile_medium: string; // image url
    profile: string; // large image url
    friend: null;
    follower: null;
  };
}

export async function GET(request: NextRequest) {
  const searchParamsUrl = new URL(request.url);
  const code = searchParamsUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const base = "https://www.strava.com";
  const path = "/oauth/token";
  const url = new URL(path, base);

  url.searchParams.append("client_id", config.strava.clientId);
  url.searchParams.append("client_secret", config.strava.clientSecret);
  url.searchParams.append("code", code);
  url.searchParams.append("grant_type", "authorization_code");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as StravaError;
    console.error("Strava callback failed", error);
    throw new Error(`HTTP error! Status: ${error.message ?? "unknown"}`);
  }

  const success = data as StravaSuccess;
  const { athlete } = success;

  const [user] = await db
    .insert(schema.user)
    .values({
      name: `${athlete.firstname} ${success.athlete.lastname}`,
      email: `${athlete.id}@condors-strava.com`,
      emailVerified: false,
      image: athlete.profile,
    })
    .returning();
  invariant(user, "user not inserted");

  await db.insert(schema.account).values({
    accountId: String(athlete.id),
    providerId: "strava",
    userId: user.id,
    accessToken: success.access_token,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: new Date(success.expires_at * 1000),
    refreshTokenExpiresAt: null,
    scope: null,
    password: null,
  });

  const [session] = await db
    .insert(schema.session)
    .values({
      expiresAt: addDays(new Date(), 7),
      token: nanoid(),
      userId: user.id,
    })
    .returning();
  invariant(session, "no session created");

  // TODO still need to encrypt the token and Set-Cookie
}
