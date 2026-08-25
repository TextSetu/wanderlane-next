'use client';

import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { localeDir } from '@/i18n/routing';
import { SITE_TIME_ZONE } from '@/lib/site';
import { BASELINE_CONTENT_HASH, BASELINE_RELEASE_VERSION } from './baseline';
import { fetchManifest, fetchModules, mergeMessages } from './client';
import { OTA_ENABLED, OTA_PREVIEW_KEY, OTA_PREVIEW_PARAM, otaLog } from './config';
import { BUILT_OPTIONS, localeOptionsFrom, type LocaleOption } from './locales';
import { modulesFor } from './modules';
import type { OtaMessages } from './types';

/**
 * Serves the build-time copy, then quietly replaces it with whatever has been
 * published since.
 *
 * The whole design turns on one ordering rule: the first render MUST use the
 * baseline, because the static HTML was pre-rendered from it. Fetching during
 * render — or seeding state from anything but `baseline` — mismatches hydration
 * against markup React has already committed to, which surfaces as scrambled
 * text rather than a clean error. The swap therefore happens in an effect,
 * after hydration, and never before.
 *
 * The common case costs one manifest read and nothing else: a freshly deployed
 * site's baseline hash matches the live release, so no blob is requested.
 */

interface OtaState {
    /** Dropdown options. Starts as the build list, replaced by the manifest's. */
    options: LocaleOption[];
    /** Locale being previewed, or null. Never a locale with a static route. */
    previewLocale: string | null;
    setPreviewLocale: (code: string | null) => void;
    releaseVersion: number | null;
}

const OtaContext = createContext<OtaState>({
    options: BUILT_OPTIONS,
    previewLocale: null,
    setPreviewLocale: () => {},
    releaseVersion: BASELINE_RELEASE_VERSION,
});

export const useOta = () => useContext(OtaContext);

export function OtaProvider({
    locale,
    baseline,
    children,
}: {
    locale: string;
    baseline: OtaMessages;
    children: React.ReactNode;
}) {
    const [messages, setMessages] = useState<OtaMessages>(baseline);
    // ⚠️ Seeded from the BUILD list, never from the manifest or storage, so the
    // first client render is byte-identical to the server's.
    const [options, setOptions] = useState<LocaleOption[]>(BUILT_OPTIONS);
    const [previewLocale, setPreviewLocaleState] = useState<string | null>(null);
    const [releaseVersion, setReleaseVersion] = useState<number | null>(
        BASELINE_RELEASE_VERSION,
    );
    const pathname = usePathname();

    /**
     * Read preview mode out of the URL and sessionStorage.
     *
     * ⚠️ NOT `useSearchParams()`. Under `output: 'export'` it returns empty at
     * prerender and forces the nearest Suspense boundary; without one,
     * `next build` fails outright. Reading `window.location` in an effect is
     * correct by construction — the first render simply does not know about
     * preview, which is exactly what hydration requires.
     */
    useEffect(() => {
        const fromUrl = new URLSearchParams(window.location.search).get(OTA_PREVIEW_PARAM);
        const stored = window.sessionStorage.getItem(OTA_PREVIEW_KEY);
        const preview = fromUrl ?? stored;
        if (preview && preview !== locale) setPreviewLocaleState(preview);
    }, [locale]);

    const setPreviewLocale = (code: string | null) => {
        setPreviewLocaleState(code);
        const url = new URL(window.location.href);
        if (code) {
            window.sessionStorage.setItem(OTA_PREVIEW_KEY, code);
            url.searchParams.set(OTA_PREVIEW_PARAM, code);
        } else {
            window.sessionStorage.removeItem(OTA_PREVIEW_KEY);
            url.searchParams.delete(OTA_PREVIEW_PARAM);
            setMessages(baseline);
        }
        window.history.replaceState(null, '', url);
    };

    /** The locale whose copy is on screen. */
    const activeLocale = previewLocale ?? locale;

    useEffect(() => {
        if (!OTA_ENABLED) {
            otaLog('disabled — serving exactly what was built');
            return;
        }

        let cancelled = false;

        void (async () => {
            const manifest = await fetchManifest();
            if (cancelled) return;
            if (!manifest) {
                otaLog('no manifest available — serving the build-time copy');
                return;
            }

            setOptions(localeOptionsFrom(manifest));
            setReleaseVersion(manifest.release.version);

            // The change-detection key. `X-TextSetu-Release` would be cheaper
            // than parsing the body, but it does not survive the CDN — the
            // manifest is served from S3, whose ETag is its own MD5.
            const upToDate = manifest.release.contentHash === BASELINE_CONTENT_HASH;
            if (upToDate && !previewLocale) {
                otaLog(
                    `up to date at release v${manifest.release.version} — nothing to fetch`,
                );
                return;
            }

            const modules = modulesFor(pathname);
            const fetched = await fetchModules(manifest, activeLocale, modules);
            if (cancelled) return;

            const names = Object.keys(fetched);
            if (names.length === 0) {
                otaLog(
                    `release v${manifest.release.version} differs but no module could ` +
                        'be fetched — keeping the build-time copy',
                );
                return;
            }

            otaLog(
                `updated to release v${manifest.release.version} ` +
                    `(built from ${BASELINE_RELEASE_VERSION ?? 'unsynced'}) ` +
                    `for ${activeLocale}: ${names.join(', ')}`,
            );
            // Preview replaces rather than overlays: the baseline is a DIFFERENT
            // language, so merging would leave untranslated namespaces showing
            // the built locale, which reads as a broken page rather than a preview.
            setMessages((current) =>
                previewLocale ? mergeMessages(baseline, fetched) : mergeMessages(current, fetched),
            );
        })();

        return () => {
            cancelled = true;
        };
        // Re-runs per route so a client-side navigation picks up the modules the
        // new page needs. `baseline` is a build constant and never changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale, pathname, activeLocale, previewLocale]);

    /**
     * Keep `<html lang/dir>` in step while previewing.
     *
     * ⚠️ `useEffect`, not `useLayoutEffect`, and `<html>` deliberately does NOT
     * carry `suppressHydrationWarning`. This runs after hydration, so there is
     * nothing to suppress — and adding it would mask the exact warning class
     * this whole design exists to prevent.
     */
    useEffect(() => {
        const el = document.documentElement;
        el.lang = activeLocale;
        el.dir = previewLocale
            ? (options.find((o) => o.code === previewLocale)?.direction ?? 'ltr')
            : localeDir(locale);
    }, [activeLocale, previewLocale, locale, options]);

    const ctx = useMemo<OtaState>(
        () => ({ options, previewLocale, setPreviewLocale, releaseVersion }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [options, previewLocale, releaseVersion],
    );

    return (
        <OtaContext.Provider value={ctx}>
            {/* `timeZone` is not inherited here — this provider is constructed
                by hand, so omitting it reintroduces the hydration mismatch that
                SITE_TIME_ZONE exists to prevent. */}
            <NextIntlClientProvider
                locale={activeLocale}
                timeZone={SITE_TIME_ZONE}
                messages={messages}
            >
                {children}
            </NextIntlClientProvider>
        </OtaContext.Provider>
    );
}
