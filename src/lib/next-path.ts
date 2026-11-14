/** Where to go after sign-in: a same-site path from `?next=`, else the blueprint list. */
export function safeNext(value: unknown): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
    ? value
    : "/blueprints";
}
