import { sql } from "@/lib/db";
import type { PlacedPart } from "@/lib/rocket/canvas";
import { PARTS, type PartId } from "@/lib/rocket/parts";

export type Blueprint = {
  id: string;
  owner_id: string;
  name: string;
  parts: PlacedPart[];
  created_at: string;
  updated_at: string;
};

/** A blueprint with its owner's username, for the share page. */
export type SharedBlueprint = Blueprint & { owner_username: string };

export const NAME_MAX = 60;
const MAX_PARTS = 200;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isBlueprintId = (id: string) => UUID.test(id);

const ADJECTIVES = [
  "Brave",
  "Cosmic",
  "Dizzy",
  "Fuzzy",
  "Giddy",
  "Jolly",
  "Lucky",
  "Mighty",
  "Plucky",
  "Rusty",
  "Sneaky",
  "Sparky",
  "Speedy",
  "Wobbly",
  "Zippy",
];
const NOUNS = [
  "Comet",
  "Falcon",
  "Firefly",
  "Hornet",
  "Kestrel",
  "Meteor",
  "Nebula",
  "Otter",
  "Pickle",
  "Pulsar",
  "Quasar",
  "Rocket",
  "Sparrow",
  "Teapot",
  "Walrus",
];

const pick = <T>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

/** e.g. "Wobbly Pickle 42". */
export const randomBlueprintName = () =>
  `${pick(ADJECTIVES)} ${pick(NOUNS)} ${Math.floor(Math.random() * 90) + 10}`;

/** Keeps only well-formed parts, so client-sent JSON can't store junk. */
export function sanitizeParts(input: unknown): PlacedPart[] | null {
  if (!Array.isArray(input) || input.length > MAX_PARTS) return null;
  const out: PlacedPart[] = [];
  for (const p of input) {
    if (
      typeof p !== "object" ||
      p === null ||
      typeof p.uid !== "string" ||
      p.uid.length > 40 ||
      !Object.hasOwn(PARTS, p.partId) ||
      !Number.isFinite(p.x) ||
      !Number.isFinite(p.y)
    ) {
      return null;
    }
    out.push({ uid: p.uid, partId: p.partId as PartId, x: p.x, y: p.y });
  }
  return out;
}

/** The driver may hand timestamps back as Dates; client props need strings. */
const iso = (v: unknown) => new Date(v as string | Date).toISOString();
const toBlueprint = <T extends Blueprint>(row: T): T => ({
  ...row,
  // jsonb reorders keys; rebuild parts in a stable shape so the builder's
  // "unchanged since load" check (JSON compare) holds and opening never autosaves.
  parts: sanitizeParts(row.parts) ?? [],
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

export async function listBlueprints(ownerId: string): Promise<Blueprint[]> {
  const rows = (await sql`
    SELECT id, owner_id, name, parts, created_at, updated_at
    FROM blueprints
    WHERE owner_id = ${ownerId}
    ORDER BY updated_at DESC
  `) as Blueprint[];
  return rows.map(toBlueprint);
}

/** Any signed-in user may read a blueprint by id: the id is the share link. */
export async function getBlueprint(
  id: string,
): Promise<SharedBlueprint | null> {
  if (!isBlueprintId(id)) return null;
  const rows = (await sql`
    SELECT b.id, b.owner_id, b.name, b.parts, b.created_at, b.updated_at,
           u.username AS owner_username
    FROM blueprints b JOIN users u ON u.user_id = b.owner_id
    WHERE b.id = ${id}
  `) as SharedBlueprint[];
  return rows[0] ? toBlueprint(rows[0]) : null;
}

export async function insertBlueprint(
  ownerId: string,
  name: string,
  parts: PlacedPart[],
): Promise<string> {
  const rows = (await sql`
    INSERT INTO blueprints (owner_id, name, parts)
    VALUES (${ownerId}, ${name}, ${JSON.stringify(parts)}::jsonb)
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}
