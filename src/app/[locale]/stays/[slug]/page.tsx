import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { localeHref, locales } from '@/i18n/routing';
import { Picture, Section } from '@/components/ui';
import {
    destinationPath,
    stayDestination,
    stayFacts,
    staySlugs,
    type StaySlug,
} from '@/lib/site';

export function generateStaticParams() {
    return locales.flatMap((locale) => staySlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: 'stays' });
    return { title: t(`items.${slug}.name`), description: t(`items.${slug}.tagline`) };
}

export default async function StayPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    if (!(staySlugs as readonly string[]).includes(slug)) notFound();
    setRequestLocale(locale);

    const t = await getTranslations('stays');
    // ⚠️ The one cross-namespace read in the site: a stay renders its city's
    // name. `modulesFor()` carries the matching `stays -> destinations` entry.
    const d = await getTranslations('destinations');
    const c = await getTranslations('common');

    const city = stayDestination[slug as StaySlug];
    const { sleeps, bedrooms } = stayFacts[slug as StaySlug];

    return (
        <Section className="pt-12">
            <a
                href={localeHref(locale, destinationPath(city))}
                className="text-sm text-sea-deep underline underline-offset-4"
            >
                {t('labels.backToCity', { city: d(`items.${city}.name`) })}
            </a>

            <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
                {t(`items.${slug}.name`)}
            </h1>
            <p className="mt-2 text-lg text-ink-soft">
                {t('labels.in', { city: d(`items.${city}.name`) })} · {t(`items.${slug}.tagline`)}
            </p>

            <Picture
                src={`/img/stays/${slug}-hero`}
                alt={t(`items.${slug}.heroAlt`)}
                width={1200}
                height={640}
                priority
                className="mt-8 aspect-[15/8] w-full rounded-card object-cover"
            />

            <div className="mt-8 grid gap-10 md:grid-cols-[2fr_1fr]">
                <div>
                    <h2 className="font-serif text-2xl text-ink">{t('labels.about')}</h2>
                    <p className="mt-3 leading-relaxed text-ink-soft">{t(`items.${slug}.body`)}</p>
                </div>
                <aside className="h-fit rounded-card border border-sand-200 bg-white p-6">
                    <h2 className="font-serif text-lg text-ink">{t('labels.details')}</h2>
                    <dl className="mt-4 space-y-2 text-sm text-ink-soft">
                        {/* Plural rules exercised here, not just declared. */}
                        <dd>{c('meta.sleeps', { count: sleeps })}</dd>
                        <dd>{c('meta.bedrooms', { count: bedrooms })}</dd>
                    </dl>
                    <a
                        href={localeHref(locale, '/booking/')}
                        className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-sand-50 transition hover:bg-ink-soft"
                    >
                        {c('cta.enquire')}
                    </a>
                </aside>
            </div>
        </Section>
    );
}
