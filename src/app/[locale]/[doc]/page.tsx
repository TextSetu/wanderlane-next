import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { defaultLocale, locales } from '@/i18n/routing';
import { Section } from '@/components/ui';
import { isLegalSlug, legalSlugs } from '@/lib/legal';
import { readLegalDocument } from '@/lib/legal-content';

/**
 * The legal documents.
 *
 * ⚠️ A dynamic segment sitting beside static ones (`/about/`, `/booking/`).
 * Next resolves static segments first, so this only ever matches the four legal
 * slugs — and `dynamicParams = false` makes anything else a build-time 404
 * rather than a runtime surprise.
 */
export const dynamicParams = false;

export function generateStaticParams() {
    return locales.flatMap((locale) => legalSlugs.map((doc) => ({ locale, doc })));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; doc: string }>;
}): Promise<Metadata> {
    const { locale, doc } = await params;
    const t = await getTranslations({ locale, namespace: 'legal' });
    return { title: t(`titles.${doc}`) };
}

export default async function LegalPage({
    params,
}: {
    params: Promise<{ locale: string; doc: string }>;
}) {
    const { locale, doc } = await params;
    if (!isLegalSlug(doc)) notFound();
    setRequestLocale(locale);

    const t = await getTranslations('legal');
    const { body, updated, usedFallback } = await readLegalDocument(doc, locale);

    return (
        <Section className="max-w-3xl pt-12">
            <h1 className="font-serif text-4xl text-ink">{t(`titles.${doc}`)}</h1>
            <p className="mt-2 text-sm text-sand-600">{t('updated', { date: updated })}</p>

            {usedFallback && (
                <p className="mt-4 rounded-lg border border-sand-200 bg-sand-100 px-4 py-2 text-sm text-sand-600">
                    This document has not been translated into {locale} yet, so the{' '}
                    {defaultLocale} version is shown.
                </p>
            )}

            <div className="prose mt-8 max-w-none text-ink-soft [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-ink [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:ps-6">
                <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
            </div>

            <p className="mt-12 border-t border-sand-200 pt-6 text-sm text-sand-600">{t('note')}</p>
        </Section>
    );
}
