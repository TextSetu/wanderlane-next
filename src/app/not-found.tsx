import messages from '../../messages/en.json';
import { defaultLocale } from '@/i18n/routing';
import { withBase } from '@/lib/base-path';
import './globals.css';

/**
 * The 404 GitHub Pages actually serves.
 *
 * ⚠️ This must live at the ROOT of `app/`, outside `[locale]`, because a static
 * export never routes an unmatched URL through Next at all — Pages reads
 * `/404.html` off disk and returns it. A `not-found.tsx` inside `[locale]` only
 * covers `notFound()` calls at build time; it is never what a lost visitor sees.
 *
 * ⚠️ It is rendered in the SOURCE LANGUAGE and cannot be otherwise. There is no
 * server to negotiate a language with and no locale in the URL to read — by
 * definition the URL did not match a route. Translating it would mean shipping
 * six 404 pages and picking between them in script, which trades a correct page
 * for a flash of the wrong one. Stating the limit is better than faking it.
 */
export const metadata = { title: messages.notfound.title };

export default function NotFound() {
    const t = messages.notfound;
    return (
        <html lang={defaultLocale} dir="ltr">
            <body>
                <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-5 text-center">
                    <p className="font-serif text-2xl text-ink">Wanderlane</p>
                    <h1 className="mt-8 font-serif text-4xl text-ink">{t.title}</h1>
                    <p className="mt-3 text-ink-soft">{t.body}</p>
                    <p className="mt-8">
                        <a
                            href={withBase('/')}
                            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-sand-50 transition hover:bg-ink-soft"
                        >
                            {t.cta}
                        </a>
                    </p>
                </main>
            </body>
        </html>
    );
}
