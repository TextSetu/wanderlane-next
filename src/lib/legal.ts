/**
 * Legal documents.
 *
 * The BODIES are markdown in `content/legal/<slug>/<locale>.md` and are
 * deliberately OUTSIDE the translation catalogue — a privacy policy is a
 * reviewed legal document, not a string a translator edits in a table. Only the
 * chrome (titles, "last updated", the table of contents) lives in the `legal`
 * namespace.
 *
 * That boundary is worth demonstrating: not all copy belongs in a TMS.
 */
export const legalSlugs = ['privacy', 'terms', 'cookies', 'accessibility'] as const;
export type LegalSlug = (typeof legalSlugs)[number];

export const legalPath = (slug: LegalSlug) => `/${slug}/`;

export function isLegalSlug(value: string): value is LegalSlug {
    return (legalSlugs as readonly string[]).includes(value);
}
