import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';

import { SITE_TIME_ZONE } from '@/lib/site';
import { defaultLocale, locales } from './routing';

/**
 * Load a locale's catalogue, falling back to the source language.
 *
 * ⚠️ The fallback is not defensive padding — it is how this repo is meant to
 * work. Translations are OWNED BY TEXTSETU, not authored here: the committed
 * `messages/*.json` are a snapshot written by `scripts/sync-translations.mjs`.
 * A fresh clone therefore has routes for every published language but files for
 * only the ones committed so far, and it must still build. Run
 * `pnpm sync-translations` and the rest appear.
 */
async function loadMessages(locale: string) {
    try {
        return (await import(`../../messages/${locale}.json`)).default;
    } catch {
        return (await import(`../../messages/${defaultLocale}.json`)).default;
    }
}

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    // The one narrowing point for an untrusted locale — see routing.ts on why
    // `Locale` is `string` rather than a literal union.
    const locale = hasLocale(locales, requested) ? requested : defaultLocale;

    // `timeZone` must be explicit — see SITE_TIME_ZONE for why.
    return { locale, timeZone: SITE_TIME_ZONE, messages: await loadMessages(locale) };
});
