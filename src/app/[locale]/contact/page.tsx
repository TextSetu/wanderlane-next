import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '@/i18n/routing';
import { Section } from '@/components/ui';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'contact.meta' });
    return { title: t('title'), description: t('description') };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('contact');

    return (
        <Section className="max-w-2xl pt-12">
            <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
            <p className="mt-3 text-ink-soft">{t('body')}</p>

            {/* No action: a static export has no server. The labels are the point. */}
            <form className="mt-8 space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-ink">
                        {t('form.name')}
                    </label>
                    <input
                        id="name"
                        name="name"
                        className="mt-1.5 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink">
                        {t('form.email')}
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="mt-1.5 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-ink">
                        {t('form.message')}
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="mt-1.5 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
                    />
                </div>
                <button
                    type="button"
                    className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-sand-50"
                >
                    {t('form.submit')}
                </button>
                <p className="text-xs text-sand-600">{t('form.note')}</p>
            </form>
        </Section>
    );
}
