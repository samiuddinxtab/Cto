"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ACCESS_TOKEN_COOKIE,
  AUTH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE
} from "@/lib/auth/cookies";
import {
  directusLogin,
  directusLogout,
  directusRegister
} from "@/lib/directus";
import { loginSchema, signupSchema } from "@/lib/validators/auth";

function expiresToMaxAgeSeconds(expires: number) {
  if (expires <= 0) return undefined;

  const asSeconds = Math.floor(expires / 1000);
  if (asSeconds > 0 && asSeconds < 60 * 60 * 24 * 365) return asSeconds;

  return expires;
}

function formDataToRecord(formData: FormData) {
  const record: Record<string, FormDataEntryValue> = {};
  for (const [key, value] of formData.entries()) {
    record[key] = value;
  }
  return record;
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse(formDataToRecord(formData));
  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const tokens = await directusLogin(parsed.data);

  const cookieStore = cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: expiresToMaxAgeSeconds(tokens.expires)
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);

  if (refreshToken) {
    try {
      await directusLogout(refreshToken);
    } catch (error) {
      void error;
    }
  }

  redirect("/login");
}

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse(formDataToRecord(formData));
  if (!parsed.success) {
    redirect("/signup?error=invalid");
  }

  await directusRegister(parsed.data);

  redirect("/login?signup=1");
}
