import { createNeonAuth } from "@neon/auth/next/server";

export const auth = createNeonAuth({
  // biome-ignore lint/style/noNonNullAssertion: required env, set via `neon env pull`
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  // biome-ignore lint/style/noNonNullAssertion: required env, 32+ chars
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
