import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { existsSync } from 'node:fs';

import generated from './src/i18n/locales.generated.json';

const isDev = process.env.NODE_ENV === 'development';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const sourceLanguage = generated.sourceLanguage;

/*
 * A CNAME means the site is served at a domain root, so a basePath would make
 * every URL wrong. The two settings must move together, and the failure
 * otherwise is a fully-built site of 404s that looks fine locally.
 */
if (basePath && existsSync('./public/CNAME')) {
    throw new Error(
        'public/CNAME (custom domain) and NEXT_PUBLIC_BASE_PATH are mutually exclusive. ' +
            'Delete the CNAME to deploy under a project path, or unset the basePath.',
    );
}

const routeSegments = [
    '/',
    '/destinations/',
    '/stays/',
    '/experiences/',
    '/booking/',
    '/about/',
    '/contact/',
    '/privacy/',
    '/terms/',
    '/cookies/',
    '/accessibility/',
];

const nextConfig: NextConfig = {
    // The site is served as plain files from GitHub Pages, so every route is
    // pre-rendered to HTML at build time.
    output: 'export',

    /*
     * ⚠️ Mandatory, not stylistic. With `false` Next emits `out/stays.html`,
     * which Pages serves at `/stays.html` and NOT at `/stays` — every internal
     * link breaks and there is no server config to fix it with. With `true` you
     * get `out/stays/index.html` and Pages 301s `/stays` → `/stays/` for free.
     */
    trailingSlash: true,

    // Required under `output: 'export'` — there is no image optimiser at runtime.
    images: { unoptimized: true },

    basePath,
    assetPrefix: basePath ? `${basePath}/` : undefined,

    /*
     * Every route lives under `app/[locale]`, so the file-system routes are
     * `/en/...` and `/fr/...`. In production `scripts/flatten-default-locale.mjs`
     * lifts `out/<source>/**` to `out/**`, which is why the source language is
     * served unprefixed and why `localeHref()` emits unprefixed links for it.
     *
     * The dev server has no such step, so those same links would 404. These
     * redirects send the unprefixed paths to their real routes, so links work in
     * dev exactly as they do once deployed.
     *
     * The key is only attached in development: `output: 'export'` warns about
     * redirects whenever the option is present, even when it resolves to an
     * empty list.
     */
    ...(isDev
        ? {
              async redirects() {
                  return routeSegments.map((path) => ({
                      source: path,
                      destination: `/${sourceLanguage}${path}`,
                      permanent: false,
                  }));
              },
          }
        : {}),
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
