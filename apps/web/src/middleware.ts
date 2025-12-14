import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ACCESS_TOKEN_COOKIE,
  AUTH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE
} from "@/lib/auth/cookies";

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expires: number;
};

const refreshResponseSchema = z.object({
  data: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires: z.number()
  })
});

function expiresToMaxAgeSeconds(expires: number) {
  if (expires <= 0) return undefined;

  const asSeconds = Math.floor(expires / 1000);
  if (asSeconds > 0 && asSeconds < 60 * 60 * 24 * 365) return asSeconds;

  return expires;
}

async function tryRefreshTokens(
  directusUrl: string,
  refreshToken: string
): Promise<RefreshResponse | null> {
  const res = await fetch(`${directusUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    })
  });

  if (!res.ok) return null;

  const json: unknown = await res.json();
  const parsed = refreshResponseSchema.safeParse(json);
  if (!parsed.success) return null;

  return {
    accessToken: parsed.data.data.access_token,
    refreshToken: parsed.data.data.refresh_token,
    expires: parsed.data.data.expires
  };
}

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) return NextResponse.next();

  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const directusUrl = process.env.DIRECTUS_URL;
  if (!directusUrl) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const refreshed = await tryRefreshTokens(directusUrl, refreshToken);
  if (!refreshed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";

    const res = NextResponse.redirect(url);
    res.cookies.delete(ACCESS_TOKEN_COOKIE);
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    return res;
  }

  const res = NextResponse.next();
  res.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: expiresToMaxAgeSeconds(refreshed.expires)
  });
  res.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30
  });

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
