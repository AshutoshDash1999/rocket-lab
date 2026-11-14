"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getAppUser, getSessionUser } from "@/lib/users";

export type OnboardingState = {
  errors?: { username?: string; age?: string; form?: string };
  values?: { username: string; age: string };
};

const USERNAME = /^[a-z0-9_]{3,20}$/;

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (await getAppUser(user.id)) redirect("/build");

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const age = Number(ageRaw);
  const values = { username, age: ageRaw };

  const errors: NonNullable<OnboardingState["errors"]> = {};
  if (!USERNAME.test(username)) {
    errors.username = "3–20 characters: letters, numbers or underscores.";
  }
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    errors.age = "Enter a whole number between 1 and 120.";
  }
  if (Object.keys(errors).length) return { errors, values };

  try {
    await sql`
      INSERT INTO users (user_id, email, username, age)
      VALUES (${user.id}, ${user.email.toLowerCase()}, ${username}, ${age})
    `;
  } catch (e) {
    const err = e as { code?: string; constraint?: string };
    if (err.code === "23505") {
      if (err.constraint === "users_username_lower_key") {
        return { errors: { username: "That username is taken." }, values };
      }
      if (err.constraint === "users_email_lower_key") {
        return {
          errors: { form: "An account with this email already exists." },
          values,
        };
      }
      // Primary key: this account was onboarded in another tab.
      redirect("/build");
    }
    console.error("onboarding insert failed", e);
    return { errors: { form: "Something went wrong. Try again." }, values };
  }

  redirect("/build");
}
