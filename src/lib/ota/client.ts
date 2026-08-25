import {
    OTA_CACHE_KEY,
    OTA_MANIFEST_TTL_MS,
    OTA_MANIFEST_URL,
    otaLog,
} from './config';
import { isManifest, type OtaManifest, type OtaMessages } from './types';

/**
 * The read path: fetch the manifest, then only the modules a route needs.
 *
 * Built on plain `fetch` with no bespoke cache for the BLOBS. They are
 * content-addressed and served `immutable`, so the browser's HTTP cache already
 * does that job — better than a hand-rolled one, and without its invalidation
 * bugs.
 *
 * The MANIFEST is different, and this is where we go beyond the marketing
 * site's implementation. `docs/api/content-delivery.md` is explicit: keep your
 * own copy of the last good manifest and fall back to it on ANY non-2xx.
 * `stale-if-error` does not cover this — CloudFront implements neither it nor
 * `stale-while-revalidate`, and browsers do not either. The stored copy stays
 * usable indefinitely because blob URLs are content-addressed and immutable.
 */

let memo: { at: number; manifest: OtaManifest } | null = null;
/** In-flight request, so N components mounting at once make one call. */
let inFlight: Promise<OtaManifest | null> | null = null;

/** A `202 building` response is polled this many times before giving up. */
const BUILDING_MAX_ATTEMPTS = 3;

function readCache(): OtaManifest | null {
    try {
        const raw = window.localStorage.getItem(OTA_CACHE_KEY);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isManifest(parsed) ? parsed : null;
    } catch {
        // Private mode, a quota error, or corrupt JSON. Not having a cache is a
        // supported state — never let it break the page.
        return null;
    }
}

function writeCache(manifest: OtaManifest): void {
    try {
        window.localStorage.setItem(OTA_CACHE_KEY, JSON.stringify(manifest));
    } catch {
        /* quota or private mode — the in-memory memo still works this session */
    }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The current manifest, or null if none could be read and none was stored.
 *
 * NEVER throws. Every caller uses the result to IMPROVE what is already on
 * screen, so a failure means "keep the baseline", not "show an error".
 *
 * ⚠️ No `If-None-Match` here, deliberately. `cache: 'default'` lets the HTTP
 * cache issue the conditional request, and `fetch` surfaces a cache-validated
 * 304 as a 200 anyway — so hand-rolling it would mean persisting an ETag to buy
 * nothing. The build-time sync script DOES send one, because a fresh CI runner
 * has no HTTP cache. That asymmetry is intentional.
 */
export async function fetchManifest(): Promise<OtaManifest | null> {
    if (memo && Date.now() - memo.at < OTA_MANIFEST_TTL_MS) return memo.manifest;
    if (inFlight) return inFlight;

    inFlight = (async () => {
        const cached = readCache();

        for (let attempt = 0; attempt < BUILDING_MAX_ATTEMPTS; attempt++) {
            let res: Response;
            try {
                res = await fetch(OTA_MANIFEST_URL, { cache: 'default' });
            } catch {
                otaLog('manifest unreachable — using the last good copy');
                return cached;
            }

            // The distribution is publishing its first release. Honour the
            // server's own pacing rather than inventing one.
            if (res.status === 202) {
                const retryAfter = Number(res.headers.get('Retry-After') ?? 5);
                otaLog(`release is building — retrying in ${retryAfter}s`);
                await sleep(Math.min(Number.isFinite(retryAfter) ? retryAfter : 5, 30) * 1000);
                continue;
            }

            // 404 (paused / rotated key), 429, any 5xx.
            if (!res.ok) {
                otaLog(`manifest responded ${res.status} — using the last good copy`);
                return cached;
            }

            const body: unknown = await res.json().catch(() => null);
            if (!isManifest(body)) {
                // Most often an app shell served 200 for a URL that does not
                // exist — see the note on `configured()` in config.ts.
                otaLog(
                    `${OTA_MANIFEST_URL} returned 200 but not a manifest ` +
                        '(an app shell, an S3 error document, or a captive portal?) ' +
                        '— using the last good copy',
                );
                return cached;
            }

            memo = { at: Date.now(), manifest: body };
            writeCache(body);
            return body;
        }

        otaLog('release still building — using the last good copy');
        return cached;
    })().finally(() => {
        inFlight = null;
    });

    return inFlight;
}

/**
 * Fetch the given modules for one locale, keyed by module name.
 *
 * The keys ARE the top-level message namespaces, so the result merges straight
 * into a next-intl message object with no mapping table. That only holds
 * because the distribution is split by module, which strips the module prefix
 * inside each file: `stays.items.x.title` ships in `stays.json` as
 * `items.x.title`.
 *
 * A module that fails is omitted rather than failing the batch: one unreachable
 * file should cost that namespace its update, not the whole page's.
 */
export async function fetchModules(
    manifest: OtaManifest,
    locale: string,
    modules: string[],
): Promise<OtaMessages> {
    const wanted = new Set(modules);
    const files = manifest.files.filter(
        (f) => f.language === locale && f.module !== null && wanted.has(f.module),
    );

    const loaded = await Promise.all(
        files.map(async (file) => {
            try {
                const res = await fetch(file.url, { cache: 'default' });
                if (!res.ok) return null;
                const body: unknown = await res.json();
                if (typeof body !== 'object' || body === null) return null;
                return [file.module as string, body] as const;
            } catch {
                return null;
            }
        }),
    );

    return Object.fromEntries(loaded.filter((entry) => entry !== null));
}

/**
 * Overlay fetched namespaces onto the built-in ones.
 *
 * ⚠️ Merges at the MODULE level and no deeper, on purpose. A published module is
 * the complete, authoritative copy of that namespace, so a key deleted upstream
 * must disappear rather than being resurrected from the baseline. The baseline
 * still covers every namespace that was NOT fetched, which is what makes a
 * partial fetch safe.
 */
export function mergeMessages(baseline: OtaMessages, fetched: OtaMessages): OtaMessages {
    return { ...baseline, ...fetched };
}
