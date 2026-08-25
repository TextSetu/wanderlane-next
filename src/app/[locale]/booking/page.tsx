import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '@/i18n/routing';
import { Eyebrow, Section } from '@/components/ui';
import { StayQuote } from '@/components/stay-quote';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'booking.meta' });
    return { title: t('title'), description: t('description') };
}

/**
 * The page the whole demo turns on.
 *
 * Cancellation terms, deposit rules and tax disclosures are exactly the strings
 * a property changes at four o'clock on a Friday — and exactly the ones that
 * must not wait for a deploy. Change `booking.policy.body` in TextSetu, publish,
 * and it lands here in about a minute with no rebuild.
 */
export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('booking');

    return (
        <Section width="narrow" pad="top">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-3 text-lg text-ink-soft">{t('intro')}</p>

            <div className="mt-10">
                <StayQuote />
            </div>

            <h2 className="mt-12 font-serif text-2xl text-ink">{t('steps.title')}</h2>
            <ol className="mt-5 space-y-5">
                {(['choose', 'hold', 'confirm'] as const).map((key, i) => (
                    <li key={key} className="flex gap-4">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm text-sand-50">
                            {i + 1}
                        </span>
                        <div>
                            <h3 className="font-medium text-ink">{t(`steps.${key}.title`)}</h3>
                            <p className="mt-1 text-sm text-ink-soft">{t(`steps.${key}.body`)}</p>
                        </div>
                    </li>
                ))}
            </ol>

            <div className="mt-12 rounded-card border border-sand-200 bg-white p-6">
                <Eyebrow>{t('policy.title')}</Eyebrow>
                <p className="leading-relaxed text-ink">{t('policy.body')}</p>
                <p className="mt-3 text-xs text-sand-600">{t('policy.updated')}</p>
            </div>

            <h2 className="mt-12 font-serif text-2xl text-ink">{t('taxes.title')}</h2>
            <p className="mt-3 text-ink-soft">{t('taxes.body')}</p>

            <p className="mt-12 border-t border-sand-200 pt-6 text-sm text-sand-600">{t('note')}</p>
        </Section>
    );
}
