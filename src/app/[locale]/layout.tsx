import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { localeDir, localeTag, locales } from '@/i18n/routing';
import { OtaProvider } from '@/lib/ota/provider';
import { site } from '@/lib/site';
import { Chrome } from '@/components/chrome';
import '../globals.css';

/**
 * The build-time locale list decides which routes exist.
 *
 * Regenerated from the live distribution by `scripts/sync-translations.mjs`, so
 * a language added in TextSetu produces a real route on the next deploy with no
 * code change here.
 */
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: {
        default: `${site.name} — small stays, well chosen`,
        template: `%s · ${site.name}`,
    },
    description:
        'Wanderlane is a small collection of independent stays in six cities, with guides written by the people who live there.',
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(locales, locale)) notFound();

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        /*
         * `dir` is set HERE, at build time, in the served bytes.
         *
         * Applying it in an effect instead would give every RTL visitor a
         * visible LTR→RTL reflow on every page load. This is the single
         * strongest reason the build-time locale list exists at all.
         *
         * ⚠️ No `suppressHydrationWarning` — see the note in ota/provider.tsx.
         */
        <html lang={localeTag(locale).html} dir={localeDir(locale)}>
            <body>
                <OtaProvider locale={locale} baseline={messages}>
                    <Chrome locale={locale}>{children}</Chrome>
                </OtaProvider>
            </body>
        </html>
    );
}
