'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { experiences } from '@/lib/site';
import type { PhotoSources } from './ui';

/**
 * The experiences grid, filterable by destination.
 *
 * The filter is a set of chips rather than a `<select>` for one reason worth
 * knowing: the counts beside them are live, and a count is the cheapest place
 * for a plural bug to hide. `t('showing', {count})` goes through the locale's
 * own plural rule here, on a number that changes as you click — so a catalogue
 * missing Arabic's `zero`, `two` or `few` category shows up immediately instead
 * of on whichever page happens to display three of something.
 */
export function ExperienceFilter({ photos }: { photos: Record<string, PhotoSources> }) {
    const t = useTranslations('experiences');
    const d = useTranslations('destinations');
    const [city, setCity] = useState<string | null>(null);

    const shown = city ? experiences.filter((e) => e.destination === city) : experiences;
    const cities = [...new Set(experiences.map((e) => e.destination))];

    const chip = (active: boolean) =>
        `rounded-full border px-4 py-1.5 text-sm transition ${
            active
                ? 'border-ink bg-ink text-sand-50'
                : 'border-sand-200 bg-white text-ink-soft hover:border-sand-400'
        }`;

    return (
        <>
            <div className="mt-8 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setCity(null)} className={chip(city === null)}>
                    {t('filter.all')}
                </button>
                {cities.map((slug) => (
                    <button
                        key={slug}
                        type="button"
                        onClick={() => setCity(slug === city ? null : slug)}
                        className={chip(city === slug)}
                    >
                        {d(`items.${slug}.name`)}
                    </button>
                ))}
                <span className="ms-auto text-sm text-sand-600" aria-live="polite">
                    {t('filter.showing', { count: shown.length })}
                </span>
            </div>

            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((experience) => {
                    const photo = photos[experience.slug];
                    return (
                        <li
                            key={experience.slug}
                            className="overflow-hidden rounded-card border border-sand-200 bg-white shadow-card"
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
                                        sizes="(max-width: 940px) 100vw, 33vw"
                                        alt={photo.alt}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                <p className="text-xs uppercase tracking-wide text-sand-600">
                                    {d(`items.${experience.destination}.name`)}
                                </p>
                                <h2 className="mt-1 font-serif text-xl text-ink">
                                    {t(`items.${experience.slug}.title`)}
                                </h2>
                                <p className="mt-2 text-sm text-ink-soft">
                                    {t(`items.${experience.slug}.summary`)}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
