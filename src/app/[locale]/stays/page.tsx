import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '@/i18n/routing';
import { Section, photoSources, type PhotoSources } from '@/components/ui';
import { StayBrowser } from '@/components/stay-browser';
import { stays } from '@/lib/site';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'stays.meta' });
    return { title: t('title'), description: t('description') };
}

export default async function StaysPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('stays');

    // Resolved on the SERVER and handed down, so the browser bundle carries the
    // twelve previews this page shows rather than all fifty-five in the manifest.
    const photos: Record<string, PhotoSources> = Object.fromEntries(
        stays.map((stay) => [
            stay.slug,
            photoSources(`stays/${stay.slug}-card`, t(`items.${stay.slug}.heroAlt`)),
        ]),
    );

    return (
        <Section pad="top">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">{t('intro')}</p>
            <StayBrowser locale={locale} photos={photos} />
        </Section>
    );
}
