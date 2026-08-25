import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { localeHref, locales } from '@/i18n/routing';
import { Picture, Section, Stat, photoSources } from '@/components/ui';
import { Gallery, type GalleryImage } from '@/components/gallery';
import {
    bookingCurrency,
    destinationPath,
    stayDestination,
    stayAmenities,
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
    const format = await getFormatter();

    const city = stayDestination[slug as StaySlug];
    const { sleeps, bedrooms, nightly } = stayFacts[slug as StaySlug];
    const cityName = d(`items.${city}.name`);

    /*
     * Three photos, each captioned for what it actually shows.
     *
     * ⚠️ Two are of the house and the third is of the city, and the captions say
     * so. A gallery that silently mixes the two is the small dishonesty every
     * travel site is accused of; naming them costs one string each.
     */
    const gallery: GalleryImage[] = [
        {
            ...photoSources(`stays/${slug}-hero`, t(`items.${slug}.heroAlt`)),
            caption: t('gallery.house'),
        },
        {
            ...photoSources(`stays/${slug}-detail`, t(`items.${slug}.detailAlt`)),
            caption: t('gallery.detail'),
        },
        {
            ...photoSources(`destinations/${city}-card`, d(`items.${city}.cardAlt`)),
            caption: t('gallery.city', { city: cityName }),
        },
    ];

    return (
        <>
            <div className="relative">
                <Picture
                    slot={`stays/${slug}-hero`}
                    alt={t(`items.${slug}.heroAlt`)}
                    shape="hero"
                    sizes="100vw"
                    priority
                    className="max-h-[56vh] min-h-[300px] w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-ink/5" />
                <div className="absolute inset-0 flex items-end">
                    <div className="mx-auto w-full max-w-6xl px-5 pb-8">
                        <a
                            href={localeHref(locale, destinationPath(city))}
                            className="text-sm text-sand-100 underline underline-offset-4 hover:text-white"
                        >
                            {t('labels.backToCity', { city: cityName })}
                        </a>
                        <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">
                            {t(`items.${slug}.name`)}
                        </h1>
                        <p className="mt-2 text-lg text-sand-100">{t(`items.${slug}.tagline`)}</p>
                    </div>
                </div>
            </div>

            <Section pad="tight">
                <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
                    <div>
                        <h2 className="font-serif text-2xl text-ink">{t('labels.about')}</h2>
                        <p className="mt-3 leading-relaxed text-ink-soft">
                            {t(`items.${slug}.body`)}
                        </p>

                        {/*
                          * One key per amenity, reused across every house — see
                          * `stayAmenities` in site.ts for why this is not twelve
                          * sentences.
                          */}
                        <h2 className="mt-10 font-serif text-2xl text-ink">
                            {t('labels.amenities')}
                        </h2>
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {stayAmenities[slug as StaySlug].map((amenity) => (
                                <li
                                    key={amenity}
                                    className="rounded-full border border-sand-200 bg-white px-3 py-1.5 text-sm text-ink-soft"
                                >
                                    {c(`amenities.${amenity}`)}
                                </li>
                            ))}
                        </ul>

                        <h2 className="mt-10 font-serif text-2xl text-ink">
                            {t('labels.gallery')}
                        </h2>
                        <div className="mt-4">
                            <Gallery images={gallery} />
                        </div>
                    </div>

                    <aside className="h-fit md:sticky md:top-20">
                        <dl className="grid gap-3">
                            {/* Plural rules exercised here, not just declared. */}
                            <Stat
                                label={t('labels.sleeps')}
                                value={c('meta.guests', { count: sleeps })}
                            />
                            <Stat
                                label={t('labels.bedrooms')}
                                value={c('meta.bedrooms', { count: bedrooms })}
                            />
                            <Stat
                                label={t('labels.rate')}
                                value={format.number(nightly, {
                                    style: 'currency',
                                    currency: bookingCurrency,
                                    maximumFractionDigits: 0,
                                })}
                            />
                            <Stat label={t('labels.city')} value={cityName} />
                        </dl>
                        <a
                            href={localeHref(locale, '/booking/')}
                            className="mt-4 inline-block w-full rounded-full bg-ink px-5 py-2.5 text-center text-sm font-medium text-sand-50 transition hover:bg-ink-soft"
                        >
                            {c('cta.enquire')}
                        </a>
                        <p className="mt-3 text-xs leading-relaxed text-sand-600">
                            {t('labels.enquireNote')}
                        </p>
                    </aside>
                </div>
            </Section>
        </>
    );
}
