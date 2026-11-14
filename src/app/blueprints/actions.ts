"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  getBlueprint,
  insertBlueprint,
  isBlueprintId,
  NAME_MAX,
  randomBlueprintName,
  sanitizeParts,
} from "@/lib/blueprints";
import { sql } from "@/lib/db";
import { requireOnboarded } from "@/lib/users";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createBlueprint() {
  const user = await requireOnboarded();
  const id = await insertBlueprint(user.user_id, randomBlueprintName(), []);
  redirect(`/build/${id}`);
}

/** Autosave from the builder. Doesn't refresh the router: the builder owns its state. */
export async function saveBlueprintParts(
  id: string,
  rawParts: unknown,
): Promise<ActionResult & { updatedAt?: string }> {
  const user = await requireOnboarded();
  const parts = sanitizeParts(rawParts);
  if (!isBlueprintId(id) || !parts) return { ok: false, error: "Bad data." };
  const rows = (await sql`
    UPDATE blueprints
    SET parts = ${JSON.stringify(parts)}::jsonb, updated_at = now()
    WHERE id = ${id} AND owner_id = ${user.user_id}
    RETURNING updated_at
  `) as { updated_at: string | Date }[];
  if (!rows[0]) return { ok: false, error: "Blueprint not found." };
  return { ok: true, updatedAt: new Date(rows[0].updated_at).toISOString() };
}

export async function renameBlueprint(
  id: string,
  rawName: string,
): Promise<ActionResult> {
  const user = await requireOnboarded();
  const name = String(rawName).trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Give it a name." };
  if (name.length > NAME_MAX) {
    return { ok: false, error: `Keep it under ${NAME_MAX} characters.` };
  }
  if (!isBlueprintId(id)) return { ok: false, error: "Blueprint not found." };
  const rows = await sql`
    UPDATE blueprints SET name = ${name}, updated_at = now()
    WHERE id = ${id} AND owner_id = ${user.user_id}
    RETURNING id
  `;
  if (!rows[0]) return { ok: false, error: "Blueprint not found." };
  refresh();
  return { ok: true };
}

export async function duplicateBlueprint(id: string): Promise<ActionResult> {
  const user = await requireOnboarded();
  const source = await getBlueprint(id);
  if (!source || source.owner_id !== user.user_id) {
    return { ok: false, error: "Blueprint not found." };
  }
  const name = `${source.name.slice(0, NAME_MAX - 7)} (copy)`;
  await insertBlueprint(user.user_id, name, source.parts);
  refresh();
  return { ok: true };
}

export async function deleteBlueprint(id: string): Promise<ActionResult> {
  const user = await requireOnboarded();
  if (!isBlueprintId(id)) return { ok: false, error: "Blueprint not found." };
  await sql`
    DELETE FROM blueprints WHERE id = ${id} AND owner_id = ${user.user_id}
  `;
  refresh();
  return { ok: true };
}

/** Copy someone's shared blueprint into your own collection, then open it. */
export async function saveToCollection(id: string) {
  const user = await requireOnboarded();
  const source = await getBlueprint(id);
  if (!source) redirect("/blueprints");
  if (source.owner_id === user.user_id) redirect(`/build/${id}`);
  const copy = await insertBlueprint(user.user_id, source.name, source.parts);
  redirect(`/build/${copy}`);
}
