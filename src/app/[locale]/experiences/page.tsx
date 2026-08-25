import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '@/i18n/routing';
import { Section, photoSources, type PhotoSources } from '@/components/ui';
import { ExperienceFilter } from '@/components/experience-filter';
import { experiences } from '@/lib/site';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'experiences.meta' });
    return { title: t('title'), description: t('description') };
}

export default async function ExperiencesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('experiences');

    const photos: Record<string, PhotoSources> = Object.fromEntries(
        experiences.map((experience) => [
            experience.slug,
            photoSources(
                `experiences/${experience.slug}-card`,
                t(`items.${experience.slug}.imageAlt`),
            ),
        ]),
    );

    return (
        <Section pad="top">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">{t('intro')}</p>
            <ExperienceFilter photos={photos} />
        </Section>
    );
}
