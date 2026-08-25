import generated from './locales.generated.json';

/**
 * The BUILD-TIME locale list: what this bundle has prerendered routes for.
 *
 * Regenerated from the live distribution's `languageDetails` by
 * `scripts/sync-translations.mjs`, so adding a language in TextSetu adds a
 * route on the next build with no code change here.
 *
 * ⚠️ This is deliberately NOT the list the language dropdown renders. That one
 * comes from the live manifest at runtime (`src/lib/ota/locales.ts`) and can be
 * AHEAD of this one between a publish and the next deploy. Keeping the two
 * distinct is the whole point of the two-layer design — see the README.
 */

export interface LocaleMeta {
    code: string;
    label: string;
    icon: string;
    direction: 'ltr' | 'rtl';
    htmlLang: string;
    ogLocale: string;
}

const META = generated.locales as LocaleMeta[];
const BY_CODE = new Map(META.map((l) => [l.code, l]));

export const localeMeta: readonly LocaleMeta[] = META;
export const locales: readonly string[] = META.map((l) => l.code);
export const defaultLocale: string = generated.sourceLanguage;

/**
 * ⚠️ `string`, not a literal union, and that is a deliberate downgrade.
 *
 * The marketing site gets `'en' | 'fr'` because its locale list is a literal in
 * source. Ours is REGENERATED at sync time, so a union would be a promise the
 * compiler enforces and the build breaks. Instead every untrusted code is
 * narrowed once, at the route boundary, with next-intl's `hasLocale`.
 */
export type Locale = string;

export function isBuiltLocale(code: string): boolean {
    return BY_CODE.has(code);
}

export function localeLabel(code: string): string {
    return BY_CODE.get(code)?.label ?? code;
}

export function localeIcon(code: string): string {
    return BY_CODE.get(code)?.icon ?? '';
}

export function localeDir(code: string): 'ltr' | 'rtl' {
    return BY_CODE.get(code)?.direction ?? 'ltr';
}

/** BCP 47 tags for `<html lang>` and `og:locale`. */
export function localeTag(code: string): { html: string; og: string } {
    const meta = BY_CODE.get(code);
    return { html: meta?.htmlLang ?? code, og: meta?.ogLocale ?? code };
}

/**
 * Builds an href for `path` under `locale`, including `basePath`.
 *
 * The source language is left unprefixed so `https://demo1.textsetu.com/stays/`
 * resolves; every other locale gets a prefix. `scripts/flatten-default-locale.mjs`
 * reshapes the export to match.
 *
 * ⚠️ basePath YES, locale segment only for non-default locales. Getting either
 * half wrong is the classic GitHub Pages 404.
 */
export function localeHref(locale: string, path = '/'): string {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    if (locale === defaultLocale) return `${base}${path}`;
    // Keep a fragment attached to the prefixed root: '/#stays' -> '/fr/#stays'
    return path === '/' ? `${base}/${locale}/` : `${base}/${locale}${path}`;
}
