import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { localeHref } from '@/i18n/routing';
import { Eyebrow, LinkCard, Picture, Section } from '@/components/ui';
import { TripPlanner } from '@/components/trip-planner';
import { destinationPath, destinationSlugs, experiences, staysPath, stays } from '@/lib/site';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'home.meta' });
    return { title: t('title'), description: t('description') };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('home');
    const c = await getTranslations('common');
    const d = await getTranslations('destinations');
    // ⚠️ The home page renders three experience titles, so it reads a namespace
    // its own route segment does not name. `modulesFor()` carries the matching
    // entry, or those three headings would stay at their build-time copy while
    // everything around them updated.
    const e = await getTranslations('experiences');

    return (
        <>
            {/*
              * The hero is full-bleed, so it sits OUTSIDE `Section` and manages
              * its own width. The photo is `priority` — it is the largest
              * contentful paint on the site's most visited page, and letting it
              * lazy-load costs the one metric anyone measures.
              */}
            <div className="relative">
                <Picture
                    slot="site/hero"
                    alt={t('hero.imageAlt')}
                    shape="banner"
                    widths={[600, 1200, 2000]}
                    sizes="100vw"
                    priority
                    className="max-h-[70vh] min-h-[380px] w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/40 to-ink/10" />
                <div className="absolute inset-0 flex items-end">
                    <div className="mx-auto w-full max-w-6xl px-5 pb-20">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-100">
                            {t('hero.eyebrow')}
                        </p>
                        <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight text-white drop-shadow-sm md:text-6xl">
                            {t('hero.title')}
                        </h1>
                        <p className="mt-4 max-w-xl text-lg text-sand-100">{t('hero.body')}</p>
                    </div>
                </div>
            </div>

            <Section pad="none" className="-mt-10">
                <TripPlanner locale={locale} />
            </Section>

            <Section>
                <Eyebrow>{t('featured.eyebrow')}</Eyebrow>
                <h2 className="font-serif text-3xl text-ink">{t('featured.title')}</h2>
                <p className="mt-2 max-w-2xl text-ink-soft">{t('featured.body')}</p>
                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {destinationSlugs.map((slug) => (
                        <li key={slug}>
                            <LinkCard href={localeHref(locale, destinationPath(slug))}>
                                <Picture
                                    slot={`destinations/${slug}-card`}
                                    alt={d(`items.${slug}.cardAlt`)}
                                    shape="card"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    imgClassName="transition duration-500 group-hover:scale-105"
                                />
                                <div className="p-5">
                                    <p className="text-xs uppercase tracking-wide text-sand-600">
                                        {d(`items.${slug}.country`)}
                                    </p>
                                    <h3 className="mt-1 font-serif text-xl text-ink">
                                        {d(`items.${slug}.name`)}
                                    </h3>
                                    <p className="mt-2 text-sm text-ink-soft">
                                        {d(`items.${slug}.tagline`)}
                                    </p>
                                    <p className="mt-3 text-sm font-medium text-sea-deep">
                                        {c('meta.staysHere', {
                                            count: stays.filter((s) => s.destination === slug)
                                                .length,
                                        })}
                                    </p>
                                </div>
                            </LinkCard>
                        </li>
                    ))}
                </ul>
                <p className="mt-6 flex flex-wrap gap-5">
                    <a
                        href={localeHref(locale, '/destinations/')}
                        className="text-sm font-medium text-sea-deep underline underline-offset-4"
                    >
                        {c('cta.allDestinations')}
                    </a>
                    <a
                        href={localeHref(locale, staysPath())}
                        className="text-sm font-medium text-sea-deep underline underline-offset-4"
                    >
                        {c('cta.allStays', { count: stays.length })}
                    </a>
                </p>
            </Section>

            <Section pad="none">
                <h2 className="mb-6 font-serif text-3xl text-ink">{t('promise.title')}</h2>
                <div className="grid gap-6 rounded-card border border-sand-200 bg-white p-8 md:grid-cols-3">
                    {(['local', 'honest', 'flexible'] as const).map((key) => (
                        <div key={key}>
                            <h3 className="font-serif text-lg text-ink">
                                {t(`promise.items.${key}.title`)}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                                {t(`promise.items.${key}.body`)}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section>
                <h2 className="font-serif text-3xl text-ink">{t('experiences.title')}</h2>
                <p className="mt-2 max-w-2xl text-ink-soft">{t('experiences.body')}</p>
                <ul className="mt-8 grid gap-6 sm:grid-cols-3">
                    {experiences.slice(0, 3).map((experience) => (
                        <li
                            key={experience.slug}
                            className="overflow-hidden rounded-card border border-sand-200 bg-white"
                        >
                            <Picture
                                slot={`experiences/${experience.slug}-card`}
                                alt={e(`items.${experience.slug}.imageAlt`)}
                                shape="card"
                                sizes="(max-width: 640px) 100vw, 33vw"
                            />
                            <div className="p-5">
                                <p className="text-xs uppercase tracking-wide text-sand-600">
                                    {d(`items.${experience.destination}.name`)}
                                </p>
                                <h3 className="mt-1 font-serif text-lg text-ink">
                                    {e(`items.${experience.slug}.title`)}
                                </h3>
                            </div>
                        </li>
                    ))}
                </ul>
                <p className="mt-6">
                    <a
                        href={localeHref(locale, '/experiences/')}
                        className="text-sm font-medium text-sea-deep underline underline-offset-4"
                    >
                        {c('cta.allExperiences')}
                    </a>
                </p>
            </Section>
        </>
    );
}
