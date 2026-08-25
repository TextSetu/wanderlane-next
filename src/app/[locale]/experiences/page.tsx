import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '@/i18n/routing';
import { Section } from '@/components/ui';

const ITEMS = [
    'kyoto-morning-market',
    'lisbon-tile-workshop',
    'marrakech-bread-oven',
    'reykjavik-tide-pools',
    'oaxaca-mole-kitchen',
    'hoi-an-basket-boat',
] as const;

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

    return (
        <Section className="pt-12">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">{t('intro')}</p>
            <ul className="mt-10 divide-y divide-sand-200 border-y border-sand-200">
                {ITEMS.map((key) => (
                    <li key={key} className="py-6">
                        <h2 className="font-serif text-xl text-ink">{t(`items.${key}.title`)}</h2>
                        <p className="mt-1.5 text-ink-soft">{t(`items.${key}.summary`)}</p>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
