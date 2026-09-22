/* How a piece of text is looked up in the voice manifest.
 *
 * On its own, away from the manifests, so the check script can import it under
 * plain node — a module that imports JSON needs import attributes there, and
 * the alternative was a second copy of this function that would drift.
 */

/** Manifest keys are the deck's headwords; lookups tolerate case and a leading article. */
export function voiceKey(text) {
  return String(text || "")
    .trim()
    .replace(/^(der|die|das|le|la|les|l'|un|une|ein|eine)\s+/i, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}
