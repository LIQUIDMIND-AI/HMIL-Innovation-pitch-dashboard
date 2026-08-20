import type { Role } from "./types";

/**
 * The role hues, mirrored from the CSS custom properties in globals.css.
 * CSS drives everything on screen; this copy exists only for the places that
 * need a literal colour in JS (the per-persona favicon).
 */
export const ROLE_HUES: Record<Role, string> = {
  hq: "#33415c",
  plant: "#6a5a72",
  ro: "#6e6357",
  dealer: "#33607f",
  lsp: "#8a5a66",
};

/** A tiny role-tinted "D" mark, inlined as a data URI — no extra network request. */
export function faviconDataUri(role: Role): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" rx="6" fill="#0B2447"/>` +
    `<path d="M9 22V10h4.5a6 6 0 1 1 0 12H9Zm3-3h1.5a3 3 0 1 0 0-6H12v6Z" fill="#ffffff"/>` +
    `<rect x="19" y="10" width="6" height="12" rx="2" fill="${ROLE_HUES[role]}"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
