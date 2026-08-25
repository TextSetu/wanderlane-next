import { BASE_PATH } from './base-path';

/**
 * The single registry that drives routes, the sitemap, hreflang, OTA module
 * resolution and the dev redirects.
 *
 * A route segment doubles as its message namespace, so adding a page means one
 * entry here and one namespace in the catalogue — nothing else.
 */

// Blank-safe for the same reason as OTA_MANIFEST_URL: an unset GitHub Actions
// variable arrives as "", and `new URL("")` in `metadataBase` throws at build.
// (NEXT_PUBLIC_BASE_PATH is deliberately NOT blank-safe — "" is its real value.)
const ORIGIN =
    process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() || 'https://demo1.textsetu.com';

/**
 * The time zone every date is formatted in.
 *
 * ⚠️ Load-bearing for a STATIC EXPORT, not a preference. With no global default,
 * next-intl formats dates in the *rendering environment's* zone — the build
 * runner's on the server, the visitor's in the browser. Those disagree, so the
 * prerendered HTML and the first client render disagree, and React reports a
 * hydration mismatch. (next-intl says so itself, via an ENVIRONMENT_FALLBACK
 * error on every server render until this is set.)
 *
 * UTC because the alternative — the reader's own zone — cannot be known at build
 * time, and guessing it is what causes the mismatch in the first place.
 */
export const SITE_TIME_ZONE = 'UTC';

export const site = {
    name: 'Wanderlane',
    /** Origin + basePath, derived together so the two can never disagree. */
    url: `${ORIGIN}${BASE_PATH}`,
    contactEmail: 'hello@wanderlane.example',
    themeColor: '#0f2a3d',
} as const;

export const destinationSlugs = [
    'kyoto',
    'lisbon',
    'marrakech',
    'reykjavik',
    'oaxaca',
    'hoi-an',
] as const;
export type DestinationSlug = (typeof destinationSlugs)[number];

/**
 * Two stays per destination.
 *
 * ⚠️ `sleeps` and `bedrooms` live HERE, not in the translation catalogue.
 * A guest count is DATA — it is identical in every language, and putting it in
 * the TMS would ask a translator to "translate" the number 4, invite a typo
 * into a factual field, and make the plural rule depend on a string round-trip.
 * Prose goes to TextSetu; facts stay in the repo. The plural FORM around the
 * number is copy, and that does live in the catalogue (`common.meta.sleeps`).
 */
export const stays = [
    { slug: 'machiya-nishijin', sleeps: 4, bedrooms: 2, destination: 'kyoto' },
    { slug: 'kamo-riverhouse', sleeps: 2, bedrooms: 1, destination: 'kyoto' },
    { slug: 'alfama-atelier', sleeps: 3, bedrooms: 1, destination: 'lisbon' },
    { slug: 'graca-rooftop', sleeps: 2, bedrooms: 1, destination: 'lisbon' },
    { slug: 'riad-zitoun', sleeps: 8, bedrooms: 4, destination: 'marrakech' },
    { slug: 'palmeraie-annex', sleeps: 4, bedrooms: 2, destination: 'marrakech' },
    { slug: 'reykjavik-turf-house', sleeps: 4, bedrooms: 2, destination: 'reykjavik' },
    { slug: 'seltjarnarnes-cabin', sleeps: 2, bedrooms: 1, destination: 'reykjavik' },
    { slug: 'casa-jalatlaco', sleeps: 6, bedrooms: 3, destination: 'oaxaca' },
    { slug: 'sierra-norte-lodge', sleeps: 4, bedrooms: 2, destination: 'oaxaca' },
    { slug: 'thu-bon-boathouse', sleeps: 2, bedrooms: 1, destination: 'hoi-an' },
    { slug: 'cam-thanh-garden', sleeps: 4, bedrooms: 2, destination: 'hoi-an' },
] as const;
export type StaySlug = (typeof stays)[number]['slug'];

export const staySlugs = stays.map((s) => s.slug) as readonly StaySlug[];

export const stayDestination: Record<StaySlug, DestinationSlug> = Object.fromEntries(
    stays.map((s) => [s.slug, s.destination]),
) as Record<StaySlug, DestinationSlug>;

export const stayFacts: Record<StaySlug, { sleeps: number; bedrooms: number }> =
    Object.fromEntries(
        stays.map((s) => [s.slug, { sleeps: s.sleeps, bedrooms: s.bedrooms }]),
    ) as Record<StaySlug, { sleeps: number; bedrooms: number }>;

export const destinationPath = (slug: DestinationSlug) => `/destinations/${slug}/`;
export const stayPath = (slug: StaySlug) => `/stays/${slug}/`;

/**
 * Top-level route segments, used by the sync script's collision guard: a locale
 * code that matched one of these would silently break `segmentOf()` and
 * post-flatten routing.
 */
export const routeSegments = [
    'destinations',
    'stays',
    'experiences',
    'booking',
    'about',
    'contact',
] as const;
