/**
 * Where the published translations live.
 *
 * `NEXT_PUBLIC_*` is inlined at build time, so this is settable per deployment
 * without a code change but not at runtime — which is right: the URL identifies
 * the distribution, and pointing a built site at a different one mid-session
 * would be a different site.
 */
export const OTA_MANIFEST_URL =
    process.env.NEXT_PUBLIC_OTA_MANIFEST_URL ??
    'https://cdn.textsetu.com/REPLACE_WITH_WANDERLANE_WEB_PUBLIC_KEY/manifest.json';

/**
 * Runtime updating can be switched off without removing the integration —
 * useful for a bisect and for local development against committed messages.
 *
 * Off does NOT mean untranslated: the build-time baseline is already inlined.
 * It means "serve exactly what was built".
 */
export const OTA_ENABLED = process.env.NEXT_PUBLIC_OTA_DISABLED !== 'true';

/**
 * How long a fetched manifest is reused within one page session.
 *
 * Matches the `max-age=60` the manifest is served with, so the in-memory memo
 * and the HTTP cache expire together rather than one masking the other.
 */
export const OTA_MANIFEST_TTL_MS = 60_000;

/** `localStorage` key holding the last manifest that was read successfully. */
export const OTA_CACHE_KEY = 'wanderlane.ota.manifest';

/** Query param and session key that carry preview mode across a page load. */
export const OTA_PREVIEW_PARAM = 'preview_locale';
export const OTA_PREVIEW_KEY = 'wanderlane.preview_locale';

/**
 * Log what the OTA layer decided, once per attempt.
 *
 * On in development, switchable on in a deployed build via
 * `NEXT_PUBLIC_OTA_DEBUG=true`. Without it the layer is silent by design —
 * right for visitors, and unhelpful the first time you are trying to work out
 * whether it ran at all, since the healthy outcome ("nothing to fetch") and the
 * broken one both look like "no blob requests in the network tab".
 */
export const OTA_DEBUG =
    process.env.NEXT_PUBLIC_OTA_DEBUG === 'true' || process.env.NODE_ENV !== 'production';

export function otaLog(message: string): void {
    if (OTA_DEBUG) console.info(`[ota] ${message}`);
}
