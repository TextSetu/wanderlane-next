import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { localeHref, locales } from '@/i18n/routing';
import { LinkCard, Picture, Section } from '@/components/ui';
import { destinationMonths, destinationPath, destinationSlugs, stays } from '@/lib/site';

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
    const c = await getTranslations('common');
    const format = await getFormatter();

    return (
        <Section pad="top">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">{t('intro')}</p>

            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
                {destinationSlugs.map((slug) => (
                    <li key={slug}>
                        <LinkCard href={localeHref(locale, destinationPath(slug))}>
                            <Picture
                                slot={`destinations/${slug}-card`}
                                alt={t(`items.${slug}.cardAlt`)}
                                shape="card"
                                imgClassName="transition duration-500 group-hover:scale-105"
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
                                <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sand-600">
                                    <span>
                                        {c('meta.staysHere', {
                                            count: stays.filter((s) => s.destination === slug)
                                                .length,
                                        })}
                                    </span>
                                    <span aria-hidden>·</span>
                                    {/* Month NAMES come from Intl, not the catalogue —
                                        see `destinationMonths` in site.ts. */}
                                    <span>
                                        {t('labels.bestIn', {
                                            months: format.list(
                                                destinationMonths[slug].map((m) =>
                                                    format.dateTime(new Date(Date.UTC(2027, m, 1)), {
                                                        month: 'short',
                                                    }),
                                                ),
                                                { type: 'conjunction' },
                                            ),
                                        })}
                                    </span>
                                </p>
                            </div>
                        </LinkCard>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
