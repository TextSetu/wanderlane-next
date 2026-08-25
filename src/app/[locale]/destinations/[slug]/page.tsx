import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { localeHref, locales } from '@/i18n/routing';
import { LinkCard, Picture, Section, Stat } from '@/components/ui';
import {
    bookingCurrency,
    destinationMonths,
    destinationSlugs,
    stayPath,
    stays,
    type DestinationSlug,
} from '@/lib/site';

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
    const format = await getFormatter();

    const here = stays.filter((stay) => stay.destination === (slug as DestinationSlug));
    const from = Math.min(...here.map((stay) => stay.nightly));
    const sleeps = Math.max(...here.map((stay) => stay.sleeps));

    return (
        <>
            <div className="relative">
                <Picture
                    slot={`destinations/${slug}-hero`}
                    alt={t(`items.${slug}.heroAlt`)}
                    shape="hero"
                    sizes="100vw"
                    priority
                    className="max-h-[56vh] min-h-[300px] w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-ink/5" />
                <div className="absolute inset-0 flex items-end">
                    <div className="mx-auto w-full max-w-6xl px-5 pb-8">
                        <p className="text-xs uppercase tracking-wide text-sand-100">
                            {t(`items.${slug}.country`)}
                        </p>
                        <h1 className="mt-1 font-serif text-4xl text-white md:text-5xl">
                            {t(`items.${slug}.name`)}
                        </h1>
                        <p className="mt-2 max-w-2xl text-lg text-sand-100">
                            {t(`items.${slug}.tagline`)}
                        </p>
                    </div>
                </div>
            </div>

            <Section pad="tight">
                {/*
                  * "At a glance" is four derived facts, not four translated
                  * strings: the counts come from `site.ts`, the money from
                  * `Intl.NumberFormat` and the months from `Intl.DateTimeFormat`.
                  * Only the four LABELS are copy.
                  */}
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat
                        label={t('glance.stays')}
                        value={c('meta.staysHere', { count: here.length })}
                    />
                    <Stat
                        label={t('glance.from')}
                        value={format.number(from, {
                            style: 'currency',
                            currency: bookingCurrency,
                            maximumFractionDigits: 0,
                        })}
                    />
                    <Stat
                        label={t('glance.sleeps')}
                        value={c('meta.upTo', { count: sleeps })}
                    />
                    <Stat
                        label={t('glance.season')}
                        value={format.list(
                            destinationMonths[slug as DestinationSlug].map((m) =>
                                format.dateTime(new Date(Date.UTC(2027, m, 1)), { month: 'short' }),
                            ),
                            { type: 'conjunction' },
                        )}
                    />
                </dl>

                <div className="mt-10 max-w-2xl">
                    <h2 className="font-serif text-2xl text-ink">{t('labels.guide')}</h2>
                    <p className="mt-3 leading-relaxed text-ink-soft">{t(`items.${slug}.body`)}</p>
                </div>
            </Section>

            <Section pad="bottom">
                <h2 className="font-serif text-2xl text-ink">
                    {t('labels.stays', { city: t(`items.${slug}.name`) })}
                </h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                    {here.map((stay) => (
                        <li key={stay.slug}>
                            <LinkCard href={localeHref(locale, stayPath(stay.slug))}>
                                <Picture
                                    slot={`stays/${stay.slug}-card`}
                                    alt={s(`items.${stay.slug}.heroAlt`)}
                                    shape="card"
                                    imgClassName="transition duration-500 group-hover:scale-105"
                                />
                                <div className="p-5">
                                    <h3 className="font-serif text-xl text-ink">
                                        {s(`items.${stay.slug}.name`)}
                                    </h3>
                                    <p className="mt-2 text-sm text-ink-soft">
                                        {s(`items.${stay.slug}.tagline`)}
                                    </p>
                                    <p className="mt-3 flex items-center justify-between text-sm">
                                        <span className="text-ink">
                                            {c('meta.perNight', {
                                                amount: format.number(stay.nightly, {
                                                    style: 'currency',
                                                    currency: bookingCurrency,
                                                    maximumFractionDigits: 0,
                                                }),
                                            })}
                                        </span>
                                        <span className="font-medium text-sea-deep">
                                            {c('cta.viewStay')}
                                        </span>
                                    </p>
                                </div>
                            </LinkCard>
                        </li>
                    ))}
                </ul>
            </Section>
        </>
    );
}
