import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { localeHref, locales } from '@/i18n/routing';
import { Card, Picture, Section } from '@/components/ui';
import { destinationSlugs, stayPath, stays, type DestinationSlug } from '@/lib/site';

export function generateStaticParams() {
    return locales.flatMap((locale) => destinationSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: 'destinations' });
    return {
        title: t(`items.${slug}.name`),
        description: t(`items.${slug}.tagline`),
    };
}

export default async function DestinationPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    if (!(destinationSlugs as readonly string[]).includes(slug)) notFound();
    setRequestLocale(locale);

    const t = await getTranslations('destinations');
    const s = await getTranslations('stays');
    const c = await getTranslations('common');
    const here = stays.filter((stay) => stay.destination === (slug as DestinationSlug));

    return (
        <>
            <Section className="pt-12">
                <p className="text-xs uppercase tracking-wide text-sand-600">
                    {t(`items.${slug}.country`)}
                </p>
                <h1 className="mt-1 font-serif text-4xl text-ink md:text-5xl">
                    {t(`items.${slug}.name`)}
                </h1>
                <p className="mt-3 max-w-2xl text-lg text-ink-soft">{t(`items.${slug}.tagline`)}</p>
                <Picture
                    src={`/img/destinations/${slug}-hero`}
                    alt={t(`items.${slug}.heroAlt`)}
                    width={1200}
                    height={640}
                    priority
                    className="mt-8 aspect-[15/8] w-full rounded-card object-cover"
                />
                <div className="mt-8 max-w-2xl">
                    <h2 className="font-serif text-2xl text-ink">{t('labels.guide')}</h2>
                    <p className="mt-3 leading-relaxed text-ink-soft">{t(`items.${slug}.body`)}</p>
                </div>
            </Section>

            <Section>
                <h2 className="font-serif text-2xl text-ink">
                    {t('labels.stays', { city: t(`items.${slug}.name`) })}
                </h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                    {here.map((stay) => (
                        <li key={stay.slug}>
                            <Card>
                                <a href={localeHref(locale, stayPath(stay.slug))} className="block">
                                    <Picture
                                        src={`/img/stays/${stay.slug}-card`}
                                        alt={s(`items.${stay.slug}.heroAlt`)}
                                        width={600}
                                        height={400}
                                        className="aspect-[3/2] w-full object-cover"
                                    />
                                    <div className="p-5">
                                        <h3 className="font-serif text-xl text-ink">
                                            {s(`items.${stay.slug}.name`)}
                                        </h3>
                                        <p className="mt-2 text-sm text-ink-soft">
                                            {s(`items.${stay.slug}.tagline`)}
                                        </p>
                                        <p className="mt-3 text-sm font-medium text-sea-deep">
                                            {c('cta.viewStay')}
                                        </p>
                                    </div>
                                </a>
                            </Card>
                        </li>
                    ))}
                </ul>
            </Section>
        </>
    );
}
