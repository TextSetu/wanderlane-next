import type { MetadataRoute } from 'next';

import { defaultLocale, localeHref, locales } from '@/i18n/routing';
import { legalPath, legalSlugs } from '@/lib/legal';
import { destinationPath, destinationSlugs, site, stayPath, staySlugs } from '@/lib/site';

/**
 * ⚠️ Built from the BUILD-TIME locale list only.
 *
 * A language that is published but not yet deployed has no page to point at, so
 * it must not appear here — nor in hreflang. That is not an oversight; it is the
 * reason a preview is worth zero SEO and the reason the publish→rebuild loop
 * exists at all.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const paths = [
        '/',
        '/destinations/',
        '/experiences/',
        '/booking/',
        '/about/',
        '/contact/',
        ...destinationSlugs.map(destinationPath),
        ...staySlugs.map(stayPath),
        ...legalSlugs.map(legalPath),
    ];

    return paths.map((path) => ({
        url: `${site.url}${localeHref(defaultLocale, path)}`,
        lastModified: new Date(),
        alternates: {
            languages: Object.fromEntries(
                locales.map((locale) => [locale, `${site.url}${localeHref(locale, path)}`]),
            ),
        },
    }));
}
