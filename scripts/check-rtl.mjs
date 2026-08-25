/**
 * Fails the build on a physical directional utility.
 *
 * RTL cannot be retrofitted: bolting it onto a finished physical-property layout
 * is a full restyling pass. Tailwind v4 ships logical properties natively, so the
 * rule costs nothing now and everything later.
 *
 *   ml-* mr-*        ->  ms-* me-*
 *   pl-* pr-*        ->  ps-* pe-*
 *   left-* right-*   ->  start-* end-*
 *   text-left/right  ->  text-start/end
 *   border-l/r       ->  border-s/e
 *   rounded-l/r      ->  rounded-s/e
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('src');

const PATTERNS = [
    { re: /(?<![\w-])(ml|mr|pl|pr)-\d/g, hint: 'use ms-/me-/ps-/pe-' },
    { re: /(?<![\w-])(left|right)-\d/g, hint: 'use start-/end-' },
    { re: /(?<![\w-])text-(left|right)(?![\w-])/g, hint: 'use text-start/text-end' },
    { re: /(?<![\w-])border-(l|r)-/g, hint: 'use border-s-/border-e-' },
    { re: /(?<![\w-])rounded-(l|r)-/g, hint: 'use rounded-s-/rounded-e-' },
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
    const text = await readFile(file, 'utf8');
    for (const { re, hint } of PATTERNS) {
        for (const match of text.matchAll(re)) {
            const line = text.slice(0, match.index).split('\n').length;
            console.error(
                `${path.relative(process.cwd(), file)}:${line}  "${match[0]}" — ${hint}`,
            );
            failures++;
        }
    }
}

if (failures > 0) {
    console.error(`\n[check-rtl] ${failures} physical directional utility(ies) found.`);
    process.exit(1);
}
console.log('[check-rtl] ok');
