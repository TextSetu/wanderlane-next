/**
 * Fails the build on a hand-written absolute URL that skipped `withBase()`.
 *
 * Next prefixes `basePath` for `next/link`, `next/image` and `router.push` — and
 * for NOTHING else. This codebase navigates with plain `<a href>` and renders
 * plain `<img src>`, so a raw absolute path silently 404s on any fork served
 * from `<user>.github.io/<repo>/`. The bug is invisible until deployed, which on
 * a public demo repo means a stranger finds it first.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('src');
const ALLOWED_FILES = new Set([
    path.resolve('src/lib/base-path.ts'),
    path.resolve('src/i18n/routing.ts'),
]);

const PATTERNS = [
    { re: /href="\//g, hint: 'href="/…" — use localeHref() or withBase()' },
    { re: /src="\//g, hint: 'src="/…" — use withBase()' },
    { re: /url\(\//g, hint: 'url(/…) in CSS — inline the asset or use a relative path' },
];

async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(full);
        else if (/\.(tsx?|css)$/.test(entry.name)) yield full;
    }
}

let failures = 0;
for await (const file of walk(ROOT)) {
    if (ALLOWED_FILES.has(file)) continue;
    const text = await readFile(file, 'utf8');
    for (const { re, hint } of PATTERNS) {
        for (const match of text.matchAll(re)) {
            const line = text.slice(0, match.index).split('\n').length;
            console.error(`${path.relative(process.cwd(), file)}:${line}  ${hint}`);
            failures++;
        }
    }
}

if (failures > 0) {
    console.error(`\n[check-base-path] ${failures} absolute URL(s) bypassed the helper.`);
    process.exit(1);
}
console.log('[check-base-path] ok');
