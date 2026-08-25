/**
 * Next's static export writes every locale under its own segment, so the source
 * language would land at `out/en/stays/index.html` and the live URL
 * `https://demo1.textsetu.com/stays/` would 404.
 *
 * This step lifts `out/<source>/**` up to `out/**` after the build, which is
 * exactly the "no prefix for the source language" scheme `localeHref()` already
 * generates links for. Added locales keep their prefix (`out/fr/stays/`).
 *
 * ⚠️ `basePath` does NOT change this layout. It rewrites URLs; `out/` is still
 * mounted at the site root (or at `/<repo>/` on a project page). So the lift is
 * the same either way.
 */
import { readdir, rename, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('out');

// Read the source language from the generated file rather than hardcoding it —
// the reference implementation hardcodes 'en', which drifts the moment the
// project's source language changes upstream.
const { sourceLanguage } = JSON.parse(
    readFileSync(path.resolve('src/i18n/locales.generated.json'), 'utf8'),
);

const source = path.join(OUT_DIR, sourceLanguage);

/**
 * Entries that MUST replace the root copy rather than be skipped.
 *
 * Next writes a bare framework `out/404.html` alongside our localised one.
 * Without this the collision guard below would refuse the lift outright.
 */
const OVERWRITE = new Set(['404.html', '404']);

if (!existsSync(source)) {
    console.error(
        `[flatten] Expected ${source} to exist. Did \`next build\` run with output: 'export'?`,
    );
    process.exit(1);
}

const entries = await readdir(source);

for (const entry of entries) {
    const from = path.join(source, entry);
    const to = path.join(OUT_DIR, entry);

    if (existsSync(to)) {
        if (OVERWRITE.has(entry)) {
            await rm(to, { recursive: true, force: true });
        } else {
            // A public/ asset must never be clobbered by a route of the same
            // name. ⚠️ Fatal, not a warning: on GitHub Pages a skipped route is
            // an invisible 404, and there is no server config to paper over it.
            const existing = await stat(to);
            console.error(
                `[flatten] Collision: "${entry}" already exists in out/ as a ${
                    existing.isDirectory() ? 'directory' : 'file'
                }. Rename the route or the public/ asset.`,
            );
            process.exit(1);
        }
    }

    await rename(from, to);
}

await rm(source, { recursive: true, force: true });

/**
 * ⚠️ GitHub Pages serves `/404.html` — that exact path — for any unmatched URL.
 *
 * That file comes from `src/app/not-found.tsx` at the ROOT of the app directory.
 * Assert it is branded rather than trusting it: the failure is completely silent
 * (green build, file present) and what visitors get is Next's unstyled framework
 * page, which nobody notices until a stranger reports it.
 */
const notFound = path.join(OUT_DIR, '404.html');
if (!existsSync(notFound)) {
    console.error('[flatten] out/404.html is missing — GitHub Pages will have no 404.');
    process.exit(1);
}
if (!readFileSync(notFound, 'utf8').includes('Wanderlane')) {
    console.error(
        '[flatten] out/404.html is the framework 404, not ours. ' +
            'Check that src/app/not-found.tsx exists at the app root.',
    );
    process.exit(1);
}

console.log(`[flatten] Lifted out/${sourceLanguage}/* to out/ (${entries.length} entries).`);
