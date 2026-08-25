import { locales } from '@/i18n/routing';
import { legalSlugs } from '@/lib/legal';
import { destinationSlugs } from '@/lib/site';

/**
 * Which message modules a route actually renders.
 *
 * The distribution splits translations into modules whose names are exactly the
 * top-level keys of `messages/<locale>.json`, and those line up with the routes.
 * So this is DERIVED from the path rather than maintained as a table — a new
 * destination or stay needs no edit here, only the entry in `site.ts` it
 * already needs.
 *
 * This is the "split chunk" methodology applied to copy: a visitor reading one
 * stay page downloads that page's namespaces and nothing else.
 */

/** On every page: `common` is nav/footer/CTAs, `consent` is the banner. */
const ALWAYS = ['common', 'consent'] as const;

/**
 * Routes whose copy is not fully derivable from their own segment.
 *
 * ⚠️ Grep for `useTranslations('` in a page before assuming its modules match
 * its path. A stay page renders its destination's name, which is the only
 * cross-namespace read today; if a second appears it belongs here rather than in
 * a widened fetch.
 */
const EXTRA: Record<string, readonly string[]> = {
    // A stay page renders its city's name.
    stays: ['destinations'],
    // The home page ('' is the home segment) shows three experience titles and
    // every destination's name.
    '': ['destinations', 'experiences'],
    // The experiences page groups by city.
    experiences: ['destinations'],
    // The booking page's quote widget lists every stay by name.
    booking: ['stays'],
};

const DESTINATIONS = new Set<string>(destinationSlugs);
const LEGAL = new Set<string>(legalSlugs);
const LOCALE = new Set<string>(locales);
const SELF = new Set(['destinations', 'stays', 'experiences', 'booking', 'about', 'contact']);

/**
 * The route segment a path identifies, with any locale prefix removed.
 *
 * Both shapes have to work: the dev server serves `/en/stays/` while the
 * deployed export serves the source language unprefixed at `/stays/` (see
 * `scripts/flatten-default-locale.mjs`). Returns '' for the home page.
 */
function segmentOf(pathname: string): string {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0 && LOCALE.has(parts[0]!)) parts.shift();
    return parts[0] ?? '';
}

/**
 * Modules to fetch for `pathname`, deduped.
 *
 * An unrecognised segment yields the always-on set plus `notfound`. That is
 * deliberate: an unknown path is a 404 whose chrome still needs its strings, and
 * guessing a module name from it would fetch nothing useful.
 */
export function modulesFor(pathname: string): string[] {
    const segment = segmentOf(pathname);
    const found = new Set<string>(ALWAYS);

    if (segment === '') {
        found.add('home');
    } else if (SELF.has(segment)) {
        // A route segment doubles as its message namespace — see `site.ts`.
        // Covers index AND detail: `/destinations/kyoto/` shares `destinations`.
        found.add(segment);
    } else if (LEGAL.has(segment)) {
        // Four documents share one namespace; their bodies are markdown in
        // content/legal/ and are not part of the catalogue at all.
        found.add('legal');
    } else if (DESTINATIONS.has(segment)) {
        found.add('destinations');
    } else {
        found.add('notfound');
    }

    for (const extra of EXTRA[segment] ?? []) found.add(extra);

    return [...found];
}
