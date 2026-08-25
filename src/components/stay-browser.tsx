'use client';

import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { localeHref } from '@/i18n/routing';
import { bookingCurrency, stayDestination, stayPath, stays, type StaySlug } from '@/lib/site';
import { Field, Select, Stepper } from './controls';
import type { PhotoSources } from './ui';

type Sort = 'name' | 'price' | 'sleeps';

/**
 * The stay list, sortable and filterable in the browser.
 *
 * ⚠️ Sorting by name uses `Intl.Collator(locale)`, never `<` or a bare
 * `localeCompare()`. Comparing translated names with `<` orders them by UTF-16
 * code unit, which puts every accented name after every unaccented one in
 * French and produces an order in Japanese and Arabic that no reader of those
 * languages would call alphabetical. This is the i18n bug that looks like
 * nothing until someone switches language.
 */
export function StayBrowser({
    locale,
    photos,
}: {
    locale: string;
    photos: Record<string, PhotoSources>;
}) {
    const t = useTranslations('stays');
    const c = useTranslations('common');
    const d = useTranslations('destinations');
    const format = useFormatter();
    const activeLocale = useLocale();

    const [city, setCity] = useState('all');
    const [sort, setSort] = useState<Sort>('name');
    const [minSleeps, setMinSleeps] = useState(1);

    const cities = [...new Set(stays.map((s) => s.destination))];

    const visible = useMemo(() => {
        const collator = new Intl.Collator(activeLocale, { sensitivity: 'base' });
        return stays
            .filter((s) => (city === 'all' || s.destination === city) && s.sleeps >= minSleeps)
            .slice()
            .sort((a, b) => {
                if (sort === 'price') return a.nightly - b.nightly;
                if (sort === 'sleeps') return b.sleeps - a.sleeps;
                return collator.compare(
                    t(`items.${a.slug}.name`),
                    t(`items.${b.slug}.name`),
                );
            });
        // `t` changes identity when the runtime layer swaps the catalogue, which
        // is exactly when a name-sorted list must be re-sorted.
    }, [activeLocale, city, minSleeps, sort, t]);

    const money = (amount: number) =>
        format.number(amount, {
            style: 'currency',
            currency: bookingCurrency,
            maximumFractionDigits: 0,
        });

    return (
        <>
            <div className="mt-8 grid gap-4 rounded-card border border-sand-200 bg-white p-5 sm:grid-cols-3">
                <Field label={t('browser.city')} htmlFor="stays-city">
                    <Select id="stays-city" value={city} onChange={setCity}>
                        <option value="all">{t('browser.allCities')}</option>
                        {cities.map((slug) => (
                            <option key={slug} value={slug}>
                                {d(`items.${slug}.name`)}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label={t('browser.sort')} htmlFor="stays-sort">
                    <Select
                        id="stays-sort"
                        value={sort}
                        onChange={(value) => setSort(value as Sort)}
                    >
                        <option value="name">{t('browser.sortName')}</option>
                        <option value="price">{t('browser.sortPrice')}</option>
                        <option value="sleeps">{t('browser.sortSleeps')}</option>
                    </Select>
                </Field>

                <Field label={t('browser.sleeps')}>
                    <Stepper
                        value={minSleeps}
                        min={1}
                        max={8}
                        onChange={setMinSleeps}
                        decreaseLabel={t('browser.fewer')}
                        increaseLabel={t('browser.more')}
                    >
                        {c('meta.guests', { count: minSleeps })}
                    </Stepper>
                </Field>
            </div>

            <p className="mt-4 text-sm text-sand-600" aria-live="polite">
                {t('browser.showing', { count: visible.length })}
            </p>

            {visible.length === 0 ? (
                <p className="mt-8 rounded-card border border-dashed border-sand-400 px-5 py-10 text-center text-ink-soft">
                    {t('browser.empty')}
                </p>
            ) : (
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((stay) => {
                        const photo = photos[stay.slug];
                        return (
                            <li key={stay.slug}>
                                <a
                                    href={localeHref(locale, stayPath(stay.slug))}
                                    className="group block overflow-hidden rounded-card border border-sand-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    {photo && (
                                        <div
                                            className="overflow-hidden bg-sand-100"
                                            style={{
                                                aspectRatio: '3 / 2',
                                                backgroundImage: photo.lqip
                                                    ? `url("${photo.lqip}")`
                                                    : undefined,
                                                backgroundSize: 'cover',
                                            }}
                                        >
                                            <img
                                                src={photo.src}
                                                srcSet={photo.srcSet}
                                                sizes="(max-width: 640px) 100vw, 33vw"
                                                alt={photo.alt}
                                                loading="lazy"
                                                decoding="async"
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <p className="text-xs uppercase tracking-wide text-sand-600">
                                            {d(`items.${stayDestination[stay.slug as StaySlug]}.name`)}
                                        </p>
                                        <h2 className="mt-1 font-serif text-xl text-ink">
                                            {t(`items.${stay.slug}.name`)}
                                        </h2>
                                        <p className="mt-2 text-sm text-ink-soft">
                                            {c('meta.sleeps', { count: stay.sleeps })}
                                        </p>
                                        <p className="mt-3 text-sm text-ink">
                                            {c('meta.perNight', { amount: money(stay.nightly) })}
                                        </p>
                                    </div>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}
