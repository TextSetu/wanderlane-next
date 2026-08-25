import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { defaultLocale } from '@/i18n/routing';
import type { LegalSlug } from './legal';

/**
 * Read a legal document's markdown body.
 *
 * ⚠️ These bodies are deliberately OUTSIDE the translation catalogue. A privacy
 * policy is reviewed and versioned as a whole document, not edited string by
 * string in a table — and a partially-translated one is worse than an
 * untranslated one. Only the chrome around it (title, "last updated", the note
 * at the foot) lives in the `legal` namespace.
 *
 * When a locale has no version, the source language is served with a visible
 * notice rather than silently.
 */
export async function readLegalDocument(
    slug: LegalSlug,
    locale: string,
): Promise<{ body: string; updated: string; usedFallback: boolean }> {
    const dir = path.join(process.cwd(), 'content', 'legal', slug);

    let raw: string | null = null;
    let usedFallback = false;
    try {
        raw = await readFile(path.join(dir, `${locale}.md`), 'utf8');
    } catch {
        raw = await readFile(path.join(dir, `${defaultLocale}.md`), 'utf8');
        usedFallback = locale !== defaultLocale;
    }

    // A single `updated: YYYY-MM-DD` line at the top, then the body.
    const match = raw.match(/^updated:\s*(\S+)\s*\n/);
    const updated = match?.[1] ?? '—';
    const body = match ? raw.slice(match[0].length) : raw;

    return { body: body.trim(), updated, usedFallback };
}
