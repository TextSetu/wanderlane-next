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
    { slug: 'machiya-nishijin', sleeps: 4, bedrooms: 2, nightly: 240, destination: 'kyoto' },
    { slug: 'kamo-riverhouse', sleeps: 2, bedrooms: 1, nightly: 185, destination: 'kyoto' },
    { slug: 'alfama-atelier', sleeps: 3, bedrooms: 1, nightly: 155, destination: 'lisbon' },
    { slug: 'graca-rooftop', sleeps: 2, bedrooms: 1, nightly: 130, destination: 'lisbon' },
    { slug: 'riad-zitoun', sleeps: 8, bedrooms: 4, nightly: 310, destination: 'marrakech' },
    { slug: 'palmeraie-annex', sleeps: 4, bedrooms: 2, nightly: 195, destination: 'marrakech' },
    { slug: 'reykjavik-turf-house', sleeps: 4, bedrooms: 2, nightly: 265, destination: 'reykjavik' },
    { slug: 'seltjarnarnes-cabin', sleeps: 2, bedrooms: 1, nightly: 210, destination: 'reykjavik' },
    { slug: 'casa-jalatlaco', sleeps: 6, bedrooms: 3, nightly: 175, destination: 'oaxaca' },
    { slug: 'sierra-norte-lodge', sleeps: 4, bedrooms: 2, nightly: 140, destination: 'oaxaca' },
    { slug: 'thu-bon-boathouse', sleeps: 2, bedrooms: 1, nightly: 120, destination: 'hoi-an' },
    { slug: 'cam-thanh-garden', sleeps: 4, bedrooms: 2, nightly: 165, destination: 'hoi-an' },
] as const;

/**
 * The booking currency.
 *
 * ⚠️ A currency CODE, never a formatted string or a symbol. `Intl.NumberFormat`
 * decides where the symbol goes, which separators to use and whether there is a
 * space — and it disagrees per locale for the same currency (fr-FR renders
 * `240,00 €`, en-GB renders `€240.00`). Hard-coding "€240" would be wrong in
 * four of the six languages this site ships in, which is the whole point of the
 * quote widget being here.
 */
/**
 * What each house has.
 *
 * ⚠️ These are KEYS into `common.amenities.*`, not sentences. Twelve houses with
 * a wifi line each would be twelve strings a translator has to keep consistent
 * and a glossary has to police; one key reused twelve times is translated once
 * and cannot drift. This is the modelling decision a TMS actually rewards, and
 * it is invisible until the second language.
 */
export const amenityKeys = [
    'kitchen',
    'wifi',
    'workspace',
    'washer',
    'terrace',
    'courtyard',
    'fireplace',
    'airCon',
    'pool',
    'garden',
    'riverside',
    'stepFree',
] as const;
export type AmenityKey = (typeof amenityKeys)[number];

export const stayAmenities: Record<StaySlug, readonly AmenityKey[]> = {
    'machiya-nishijin': ['kitchen', 'wifi', 'courtyard', 'washer', 'garden'],
    'kamo-riverhouse': ['kitchen', 'wifi', 'workspace', 'riverside', 'airCon'],
    'alfama-atelier': ['kitchen', 'wifi', 'workspace', 'terrace'],
    'graca-rooftop': ['kitchen', 'wifi', 'terrace', 'airCon'],
    'riad-zitoun': ['kitchen', 'wifi', 'courtyard', 'pool', 'terrace', 'airCon'],
    'palmeraie-annex': ['kitchen', 'wifi', 'pool', 'garden', 'airCon', 'stepFree'],
    'reykjavik-turf-house': ['kitchen', 'wifi', 'fireplace', 'washer', 'garden'],
    'seltjarnarnes-cabin': ['kitchen', 'wifi', 'fireplace', 'workspace'],
    'casa-jalatlaco': ['kitchen', 'wifi', 'courtyard', 'washer', 'terrace', 'stepFree'],
    'sierra-norte-lodge': ['kitchen', 'fireplace', 'garden', 'stepFree'],
    'thu-bon-boathouse': ['kitchen', 'wifi', 'riverside', 'terrace', 'airCon'],
    'cam-thanh-garden': ['kitchen', 'wifi', 'garden', 'pool', 'airCon', 'stepFree'],
};

export const bookingCurrency = 'EUR';

/**
 * When each destination is at its best. Month INDEXES, not names.
 *
 * Same reasoning as `sleeps`: a month name is not copy a translator should be
 * asked to retype, and `Intl.DateTimeFormat` already knows every one of them in
 * every language. Storing 3 and formatting it beats storing "April" and
 * translating it five times.
 */
export const destinationMonths: Record<DestinationSlug, readonly number[]> = {
    kyoto: [3, 4, 10, 11],
    lisbon: [3, 4, 5, 8, 9],
    marrakech: [2, 3, 9, 10],
    reykjavik: [5, 6, 7, 8],
    oaxaca: [9, 10, 11, 2],
    'hoi-an': [1, 2, 3, 6, 7],
};
export type StaySlug = (typeof stays)[number]['slug'];

export const staySlugs = stays.map((s) => s.slug) as readonly StaySlug[];

export const stayDestination: Record<StaySlug, DestinationSlug> = Object.fromEntries(
    stays.map((s) => [s.slug, s.destination]),
) as Record<StaySlug, DestinationSlug>;

export interface StayFacts {
    sleeps: number;
    bedrooms: number;
    /** Per night, in `bookingCurrency`, before tax. */
    nightly: number;
}

export const stayFacts: Record<StaySlug, StayFacts> = Object.fromEntries(
    stays.map((s) => [s.slug, { sleeps: s.sleeps, bedrooms: s.bedrooms, nightly: s.nightly }]),
) as Record<StaySlug, StayFacts>;

export const destinationPath = (slug: DestinationSlug) => `/destinations/${slug}/`;
export const stayPath = (slug: StaySlug) => `/stays/${slug}/`;

/**
 * Top-level route segments, used by the sync script's collision guard: a locale
 * code that matched one of these would silently break `segmentOf()` and
 * post-flatten routing.
 */
/**
 * The experiences, and which destination each belongs to.
 *
 * The pairing is DATA rather than a prefix parsed off the slug: `hoi-an-basket-boat`
 * would need the reader to know that `hoi-an` is two segments of a destination
 * and `basket-boat` two of an experience, which no string split can decide.
 */
export const experiences = [
    { slug: 'kyoto-morning-market', destination: 'kyoto' },
    { slug: 'lisbon-tile-workshop', destination: 'lisbon' },
    { slug: 'marrakech-bread-oven', destination: 'marrakech' },
    { slug: 'reykjavik-tide-pools', destination: 'reykjavik' },
    { slug: 'oaxaca-mole-kitchen', destination: 'oaxaca' },
    { slug: 'hoi-an-basket-boat', destination: 'hoi-an' },
] as const satisfies readonly { slug: string; destination: DestinationSlug }[];

export type ExperienceSlug = (typeof experiences)[number]['slug'];

export const staysPath = () => '/stays/';

export const routeSegments = [
    'destinations',
    'stays',
    'experiences',
    'booking',
    'about',
    'contact',
] as const;
