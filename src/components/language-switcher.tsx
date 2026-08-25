'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { defaultLocale, localeHref, locales } from '@/i18n/routing';
import { useOta } from '@/lib/ota/provider';

/**
 * The language switcher — rendered from the LIVE manifest, never a hardcoded list.
 *
 * Labels, flags, direction and ORDER all come off the wire (`languageDetails`),
 * with the build-time snapshot as the first-paint value and the fallback when the
 * manifest is unreachable.
 *
 * ⚠️ The interesting case is a language the manifest has and this build does not.
 * A statically exported site physically cannot serve a route it never built, so
 * such an entry is rendered as a <button>, NOT an <a>:
 *
 *   - no href ⇒ structurally incapable of 404ing;
 *   - inert and visibly so with JS off, which is honest — with JS off there is
 *     genuinely nothing we can do for that language;
 *   - clicking it enters PREVIEW mode, which swaps the copy client-side but
 *     emits no hreflang, no sitemap entry, and leaves the canonical clean.
 *
 * Preview is worth exactly zero SEO. That is not a flaw to hide — it is the
 * argument for the publish→rebuild loop, and the demo should show it.
 */
export function LanguageSwitcher({ locale }: { locale: string }) {
    const t = useTranslations('common');
    const { options, previewLocale, setPreviewLocale } = useOta();
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    /** Strip the locale prefix so the switch keeps the visitor on the same page. */
    const bare = (() => {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length > 0 && (locales as readonly string[]).includes(parts[0]!)) parts.shift();
        return parts.length ? `/${parts.join('/')}/` : '/';
    })();

    const active = previewLocale ?? locale;
    const current = options.find((o) => o.code === active);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="listbox"
                className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:border-sand-400"
            >
                <span aria-hidden>{current?.icon || '🌐'}</span>
                <span>{current?.label ?? active}</span>
                {/* Vertical caret — direction-neutral, so it must NOT mirror in RTL. */}
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="opacity-60">
                    <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute end-0 z-50 mt-2 max-h-80 w-56 overflow-auto rounded-card border border-sand-200 bg-white py-1 shadow-card"
                >
                    {options.map((option) => {
                        const isActive = option.code === active;

                        // Built ⇒ a real, navigable, prerendered route.
                        if (option.built) {
                            return (
                                <li key={option.code}>
                                    <a
                                        href={localeHref(option.code, bare)}
                                        onClick={() => setPreviewLocale(null)}
                                        role="option"
                                        aria-selected={isActive}
                                        className={`flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-sand-100 ${
                                            isActive ? 'font-semibold text-sea-deep' : 'text-ink'
                                        }`}
                                    >
                                        <span aria-hidden className="w-5 text-center">
                                            {option.icon}
                                        </span>
                                        <span>{option.label}</span>
                                    </a>
                                </li>
                            );
                        }

                        // Published but not yet deployed. A button, never a link.
                        return (
                            <li key={option.code}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewLocale(option.code);
                                        setOpen(false);
                                    }}
                                    role="option"
                                    aria-selected={isActive}
                                    aria-describedby="ota-preview-hint"
                                    className="flex w-full items-center gap-3 px-3 py-2 text-start text-sm text-ink-soft transition hover:bg-sand-100"
                                >
                                    <span aria-hidden className="w-5 text-center">
                                        {option.icon}
                                    </span>
                                    <span className="flex-1">{option.label}</span>
                                    <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sand-600">
                                        {t('locale.previewBadge')}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                    <li
                        id="ota-preview-hint"
                        className="border-t border-sand-200 px-3 py-2 text-xs text-sand-600"
                    >
                        {t('locale.previewHint')}
                    </li>
                </ul>
            )}
        </div>
    );
}

/** Banner shown while previewing a language that has no static page yet. */
export function PreviewBanner() {
    const t = useTranslations('common');
    const { previewLocale, setPreviewLocale, options, releaseVersion } = useOta();
    if (!previewLocale) return null;

    const label = options.find((o) => o.code === previewLocale)?.label ?? previewLocale;

    return (
        <div className="bg-ink px-4 py-2 text-center text-sm text-sand-100">
            <span>{t('locale.previewBanner', { language: label, version: releaseVersion ?? 0 })}</span>{' '}
            <button
                type="button"
                onClick={() => setPreviewLocale(null)}
                className="underline underline-offset-2 hover:text-white"
            >
                {t('locale.previewExit', { language: defaultLocale })}
            </button>
        </div>
    );
}
