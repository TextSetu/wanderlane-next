/**
 * Every committed locale must carry exactly the source language's keys.
 *
 * A missing key is not a compile error and not a runtime error either —
 * next-intl renders the key path itself, so `stays.browser.sortPrice` appears in
 * the UI looking like a bug in someone else's code. An EXTRA key is just as
 * worth catching: it is copy that was renamed on one side and left behind on the
 * other, which a translator will keep being asked to maintain forever.
 *
 * Run: node scripts/check-i18n.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import locales from '../src/i18n/locales.generated.json' with { type: 'json' };

const DIR = path.join(import.meta.dirname, '..', 'messages');
const SOURCE = locales.sourceLanguage;

function keysOf(value, prefix = '') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
    return Object.entries(value).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k));
}

const files = (await readdir(DIR)).filter((f) => f.endsWith('.json'));
const read = async (locale) =>
    JSON.parse(await readFile(path.join(DIR, `${locale}.json`), 'utf8'));

const source = new Set(keysOf(await read(SOURCE)));
let failed = false;

for (const file of files) {
    const locale = path.basename(file, '.json');
    if (locale === SOURCE) continue;

    const theirs = new Set(keysOf(await read(locale)));
    const missing = [...source].filter((k) => !theirs.has(k));
    const extra = [...theirs].filter((k) => !source.has(k));

    if (missing.length === 0 && extra.length === 0) {
        console.log(`[i18n] ${locale}: ${theirs.size} keys, matches ${SOURCE}`);
        continue;
    }

    failed = true;
    if (missing.length > 0) {
        console.error(`[i18n] ${locale} is MISSING ${missing.length} key(s):`);
        for (const k of missing.slice(0, 20)) console.error(`         ${k}`);
        if (missing.length > 20) console.error(`         … and ${missing.length - 20} more`);
    }
    if (extra.length > 0) {
        console.error(`[i18n] ${locale} has ${extra.length} key(s) not in ${SOURCE}:`);
        for (const k of extra.slice(0, 20)) console.error(`         ${k}`);
        if (extra.length > 20) console.error(`         … and ${extra.length - 20} more`);
    }
}

if (failed) {
    console.error(
        '\n[i18n] Fix the catalogue, or push the new source keys to TextSetu and pull ' +
            'the translations back (`pnpm dlx @textsetu/cli push` / `pull`).',
    );
    process.exit(1);
}
