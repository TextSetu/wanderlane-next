import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { localeHref, locales } from '@/i18n/routing';
import { Card, Picture, Section } from '@/components/ui';
import { destinationPath, destinationSlugs } from '@/lib/site';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'destinations.meta' });
    return { title: t('title'), description: t('description') };
}

export default async function DestinationsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('destinations');

    return (
        <Section className="pt-12">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">{t('intro')}</p>

            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
                {destinationSlugs.map((slug) => (
                    <li key={slug}>
                        <Card>
                            <a href={localeHref(locale, destinationPath(slug))} className="block">
                                <Picture
                                    src={`/img/destinations/${slug}-card`}
                                    alt={t(`items.${slug}.heroAlt`)}
                                    width={600}
                                    height={400}
                                    className="aspect-[3/2] w-full object-cover"
                                />
                                <div className="p-5">
                                    <p className="text-xs uppercase tracking-wide text-sand-600">
                                        {t(`items.${slug}.country`)}
                                    </p>
                                    <h2 className="mt-1 font-serif text-2xl text-ink">
                                        {t(`items.${slug}.name`)}
                                    </h2>
                                    <p className="mt-2 text-sm text-ink-soft">
                                        {t(`items.${slug}.tagline`)}
                                    </p>
                                </div>
                            </a>
                        </Card>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
