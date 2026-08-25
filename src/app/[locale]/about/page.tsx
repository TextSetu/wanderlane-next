import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '@/i18n/routing';
import { Section } from '@/components/ui';
import credits from '../../../../content/credits.json';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'about.meta' });
    return { title: t('title'), description: t('description') };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('about');

    return (
        <Section className="max-w-3xl pt-12">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-4 leading-relaxed text-ink-soft">{t('body')}</p>

            <h2 className="mt-10 font-serif text-2xl text-ink">{t('why.title')}</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{t('why.body')}</p>

            <h2 className="mt-10 font-serif text-2xl text-ink">{t('credits.title')}</h2>
            <p className="mt-3 text-ink-soft">{t('credits.body')}</p>
            <ul className="mt-4 space-y-1 text-sm text-sand-600">
                {credits.photos.map((photo) => (
                    <li key={photo.file}>
                        {photo.file} — {photo.photographer} ({photo.license})
                    </li>
                ))}
            </ul>
        </Section>
    );
}
