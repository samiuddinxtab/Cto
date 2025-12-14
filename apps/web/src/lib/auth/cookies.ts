export const ACCESS_TOKEN_COOKIE = "directus_access_token";
export const REFRESH_TOKEN_COOKIE = "directus_refresh_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};
