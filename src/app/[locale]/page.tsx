import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { localeHref } from '@/i18n/routing';
import { Card, Eyebrow, Picture, Section } from '@/components/ui';
import { destinationPath, destinationSlugs } from '@/lib/site';

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

    return (
        <>
            <Section className="pt-16">
                <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
                <h1 className="max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
                    {t('hero.title')}
                </h1>
                <p className="mt-5 max-w-2xl text-lg text-ink-soft">{t('hero.body')}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <a
                        href={localeHref(locale, '/destinations/')}
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-sand-50 transition hover:bg-ink-soft"
                    >
                        {t('hero.primary')}
                    </a>
                    <a
                        href={localeHref(locale, '/about/')}
                        className="rounded-full border border-sand-400 px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
                    >
                        {t('hero.secondary')}
                    </a>
                </div>
            </Section>

            <Section>
                <h2 className="font-serif text-3xl text-ink">{t('featured.title')}</h2>
                <p className="mt-2 max-w-2xl text-ink-soft">{t('featured.body')}</p>
                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {destinationSlugs.map((slug) => (
                        <li key={slug}>
                            <Card>
                                <a href={localeHref(locale, destinationPath(slug))} className="block">
                                    <Picture
                                        src={`/img/destinations/${slug}-card`}
                                        alt={d(`items.${slug}.heroAlt`)}
                                        width={600}
                                        height={400}
                                        className="aspect-[3/2] w-full object-cover"
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
                                    </div>
                                </a>
                            </Card>
                        </li>
                    ))}
                </ul>
                <p className="mt-6">
                    <a
                        href={localeHref(locale, '/destinations/')}
                        className="text-sm font-medium text-sea-deep underline underline-offset-4"
                    >
                        {c('cta.allDestinations')}
                    </a>
                </p>
            </Section>

            <Section>
                <h2 className="font-serif text-3xl text-ink">{t('promise.title')}</h2>
                <ul className="mt-8 grid gap-6 md:grid-cols-3">
                    {(['local', 'honest', 'flexible'] as const).map((key) => (
                        <li key={key} className="rounded-card border border-sand-200 bg-white p-6">
                            <h3 className="font-serif text-lg text-ink">
                                {t(`promise.items.${key}.title`)}
                            </h3>
                            <p className="mt-2 text-sm text-ink-soft">
                                {t(`promise.items.${key}.body`)}
                            </p>
                        </li>
                    ))}
                </ul>
            </Section>
        </>
    );
}
