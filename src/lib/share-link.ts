/**
 * Copy a blueprint's share link. Falls back to a prompt the user can copy from
 * when the clipboard is blocked (e.g. insecure origin). Returns true if copied.
 */
export async function copyShareLink(id: string): Promise<boolean> {
  const url = `${window.location.origin}/b/${id}`;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    window.prompt("Copy this share link:", url);
    return false;
  }
}
