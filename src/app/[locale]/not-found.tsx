'use client';

import { useTranslations } from 'next-intl';

import { localeHref, defaultLocale } from '@/i18n/routing';
import { Section } from '@/components/ui';

/**
 * Covers `notFound()` raised inside a locale route at build time.
 *
 * ⚠️ NOT the page a lost visitor sees — see `src/app/not-found.tsx` for why.
 */
export default function NotFound() {
    const t = useTranslations('notfound');
    return (
        <Section width="narrow" pad="top" className="text-center">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-3 text-ink-soft">{t('body')}</p>
            <p className="mt-6">
                <a href={localeHref(defaultLocale, '/')} className="text-sm font-medium text-sea-deep underline underline-offset-4">
                    {t('cta')}
                </a>
            </p>
        </Section>
    );
}
