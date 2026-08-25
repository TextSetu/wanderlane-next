'use client';

import { useTranslations } from 'next-intl';

import { localeHref } from '@/i18n/routing';
import { legalSlugs, legalPath } from '@/lib/legal';
import { site } from '@/lib/site';
import { LanguageSwitcher, PreviewBanner } from './language-switcher';
import { OtaStatusChip } from './ota-status';

/**
 * Nav + footer.
 *
 * ⚠️ Navigation is plain `<a href={localeHref(...)}>`, never `next/link`, and
 * `localeHref` is what applies `basePath`. See `src/lib/base-path.ts` — Next
 * prefixes basePath for `next/link` and nothing else, so a raw anchor that
 * skipped the helper would 404 on any fork served from a project path.
 */

const NAV = [
    { href: '/destinations/', key: 'nav.destinations' },
    { href: '/stays/', key: 'nav.stays' },
    { href: '/experiences/', key: 'nav.experiences' },
    { href: '/booking/', key: 'nav.booking' },
    { href: '/about/', key: 'nav.about' },
] as const;

export function Chrome({ locale, children }: { locale: string; children: React.ReactNode }) {
    const t = useTranslations('common');

    return (
        <>
            <PreviewBanner />

            <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-3">
                    <a
                        href={localeHref(locale, '/')}
                        className="font-serif text-xl font-semibold tracking-tight text-ink"
                    >
                        {site.name}
                    </a>

                    <nav className="hidden flex-1 items-center gap-6 md:flex">
                        {NAV.map((item) => (
                            <a
                                key={item.href}
                                href={localeHref(locale, item.href)}
                                className="text-sm text-ink-soft transition hover:text-sea-deep"
                            >
                                {t(item.key)}
                            </a>
                        ))}
                    </nav>

                    <div className="ms-auto flex items-center gap-3 md:ms-0">
                        <LanguageSwitcher locale={locale} />
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="mt-16 border-t border-sand-200 bg-white">
                <div className="mx-auto w-full max-w-6xl px-5 py-10">
                    <div className="flex flex-wrap items-start justify-between gap-8">
                        <div className="max-w-sm">
                            <p className="font-serif text-lg text-ink">{site.name}</p>
                            <p className="mt-2 text-sm text-ink-soft">{t('footer.blurb')}</p>
                        </div>
                        <nav className="flex flex-col gap-2">
                            {legalSlugs.map((slug) => (
                                <a
                                    key={slug}
                                    href={localeHref(locale, legalPath(slug))}
                                    className="text-sm text-ink-soft transition hover:text-sea-deep"
                                >
                                    {t(`footer.legal.${slug}`)}
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-sand-200 pt-6">
                        <p className="max-w-lg text-xs text-sand-600">{t('footer.disclaimer')}</p>
                        {/* The runtime layer, made legible. See ota-status.tsx. */}
                        <OtaStatusChip />
                    </div>
                </div>
            </footer>
        </>
    );
}
