import { isBuiltLocale, localeMeta } from '@/i18n/routing';
import type { OtaManifest } from './types';

/**
 * The RUNTIME locale list — what the language dropdown renders.
 *
 * ⚠️ This is not `src/i18n/routing.ts`'s list, and the difference is the whole
 * point of the two-layer design. `routing.ts` answers "what did this build
 * prerender routes for". This answers "what has been published". Between a
 * publish and the next deploy the second is AHEAD of the first, and the UI has
 * to represent that honestly rather than pick one and pretend.
 */

export interface LocaleOption {
    code: string;
    label: string;
    icon: string;
    direction: 'ltr' | 'rtl';
    /** Does a prerendered route exist? False ⇒ preview only, never a link. */
    built: boolean;
}

/** The build-time snapshot. Also the value the dropdown renders on first paint. */
export const BUILT_OPTIONS: LocaleOption[] = localeMeta.map((l) => ({
    code: l.code,
    label: l.label,
    icon: l.icon,
    direction: l.direction,
    built: true,
}));

/**
 * Manifest → dropdown options.
 *
 * Three rules, each load-bearing:
 *
 * 1. `languageDetails` is OPTIONAL — absent on releases published before the
 *    field existed — so fall back to `languages`, as the docs mandate.
 * 2. Manifest order is preserved. That order is curated upstream; re-sorting it
 *    alphabetically throws away a decision someone made deliberately.
 * 3. Any BUILT locale the manifest no longer lists is appended rather than
 *    dropped. Removing a language from the distribution does not delete the HTML
 *    already in `out/` — someone may be standing on that page right now, and
 *    vanishing from the switcher would strand them there.
 */
export function localeOptionsFrom(manifest: OtaManifest): LocaleOption[] {
    const details =
        manifest.languageDetails ??
        manifest.languages.map((code) => ({
            code,
            label: code,
            icon: null,
            direction: 'ltr' as const,
        }));

    const seen = new Set<string>();
    const options: LocaleOption[] = details.map((d) => {
        seen.add(d.code);
        return {
            code: d.code,
            label: d.label || d.code,
            icon: d.icon ?? '',
            direction: d.direction === 'rtl' ? 'rtl' : 'ltr',
            built: isBuiltLocale(d.code),
        };
    });

    for (const built of BUILT_OPTIONS) {
        if (!seen.has(built.code)) options.push(built);
    }

    return options;
}
