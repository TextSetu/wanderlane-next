/**
 * Generates placeholder imagery so a fresh clone renders complete.
 *
 * ⚠️ These are NOT the shipped photographs. They are deterministic gradients
 * keyed off the slug, present so the layout, aspect ratios and CLS behaviour are
 * real before anyone sources licensed photography. Replace the files in
 * `public/img/**` with Unsplash/Pexels images at the same paths and widths, and
 * record each one in `content/credits.json`.
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DESTINATIONS = ['kyoto', 'lisbon', 'marrakech', 'reykjavik', 'oaxaca', 'hoi-an'];
const STAYS = [
    'machiya-nishijin', 'kamo-riverhouse', 'alfama-atelier', 'graca-rooftop',
    'riad-zitoun', 'palmeraie-annex', 'reykjavik-turf-house', 'seltjarnarnes-cabin',
    'casa-jalatlaco', 'sierra-norte-lodge', 'thu-bon-boathouse', 'cam-thanh-garden',
];

/** Stable hue per slug, so a rebuild never reshuffles the palette. */
function hue(slug) {
    let h = 0;
    for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
}

function svg(slug, w, h) {
    const a = hue(slug);
    const b = (a + 40) % 360;
    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
           <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
             <stop offset="0%" stop-color="hsl(${a},32%,62%)"/>
             <stop offset="100%" stop-color="hsl(${b},38%,38%)"/>
           </linearGradient></defs>
           <rect width="${w}" height="${h}" fill="url(#g)"/>
         </svg>`,
    );
}

async function emit(dir, slug, kind, ratio) {
    for (const width of [600, 1200]) {
        const height = Math.round(width / ratio);
        const out = path.join('public/img', dir, `${slug}-${kind}-${width}.webp`);
        await mkdir(path.dirname(out), { recursive: true });
        await writeFile(out, await sharp(svg(slug, width, height)).webp({ quality: 70 }).toBuffer());
    }
}

for (const slug of DESTINATIONS) {
    await emit('destinations', slug, 'card', 3 / 2);
    await emit('destinations', slug, 'hero', 15 / 8);
}
for (const slug of STAYS) {
    await emit('stays', slug, 'card', 3 / 2);
    await emit('stays', slug, 'hero', 15 / 8);
}
console.log('[placeholders] wrote public/img/{destinations,stays}/*.webp');
