import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

export type AppUser = {
  user_id: string;
  email: string;
  username: string;
  age: number;
};

export async function getAppUser(userId: string): Promise<AppUser | null> {
  const rows = (await sql`
    SELECT user_id, email, username, age FROM users WHERE user_id = ${userId}
  `) as AppUser[];
  return rows[0] ?? null;
}

export async function getSessionUser() {
  await connection(); // session is per-request; skip it during prerender
  const { data } = await auth.getSession();
  return data?.user ?? null;
}

/** Redirects to `/` when signed out and `/onboarding` when not onboarded. */
export async function requireOnboarded(): Promise<AppUser> {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const appUser = await getAppUser(user.id);
  if (!appUser) redirect("/onboarding");
  return appUser;
}
