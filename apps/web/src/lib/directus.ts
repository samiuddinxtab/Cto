import "server-only";

import { createDirectus, rest, staticToken } from "@directus/sdk";
import { cookies } from "next/headers";
import { z } from "zod";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

type DirectusSchema = Record<string, unknown>;

export type DirectusAuthTokens = {
  accessToken: string;
  refreshToken: string;
  expires: number;
};

export function createDirectusClient(accessToken?: string) {
  let client = createDirectus<DirectusSchema>(env.DIRECTUS_URL);
  if (accessToken) {
    client = client.with(staticToken(accessToken));
  }
  return client.with(rest());
}

export function getServerDirectusClient() {
  const accessToken = cookies().get(ACCESS_TOKEN_COOKIE)?.value;
  return createDirectusClient(accessToken);
}

const authResponseSchema = z.object({
  data: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires: z.number()
  })
});

export async function directusLogin(input: {
  email: string;
  password: string;
}): Promise<DirectusAuthTokens> {
  const res = await fetch(`${env.DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Directus login failed (${res.status})`);
  }

  const json: unknown = await res.json();
  const parsed = authResponseSchema.parse(json);

  return {
    accessToken: parsed.data.access_token,
    refreshToken: parsed.data.refresh_token,
    expires: parsed.data.expires
  };
}

export async function directusRefresh(refreshToken: string): Promise<DirectusAuthTokens> {
  const res = await fetch(`${env.DIRECTUS_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Directus refresh failed (${res.status})`);
  }

  const json: unknown = await res.json();
  const parsed = authResponseSchema.parse(json);

  return {
    accessToken: parsed.data.access_token,
    refreshToken: parsed.data.refresh_token,
    expires: parsed.data.expires
  };
}

export async function directusLogout(refreshToken: string): Promise<void> {
  await fetch(`${env.DIRECTUS_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    }),
    cache: "no-store"
  });
}

export async function directusRegister(input: {
  email: string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${env.DIRECTUS_URL}/users/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Directus registration failed (${res.status})`);
  }
}
