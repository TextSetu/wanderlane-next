import generated from '../../content/photos.generated.json';

/**
 * The photography slots and their inline previews.
 *
 * A slot name — `destinations/kyoto-hero` — is the single identifier for an
 * image: `content/photos.json` maps it to an Unsplash id, `scripts/fetch-photos.mjs`
 * writes `public/img/<slot>-<width>.webp` from it, and `<Picture slot=…>` renders
 * it. One name, so a renamed image cannot half-exist.
 */

export type PhotoSlot = keyof typeof generated.previews;

interface Preview {
    /** A 24px-wide WebP, inlined. See `Picture` for why it is a background. */
    lqip: string;
    width: number;
    height: number;
}

const previews = generated.previews as Record<string, Preview | undefined>;

/**
 * The preview for a slot, or null.
 *
 * ⚠️ Null rather than a throw. A missing preview means a slot was added to
 * `content/photos.json` and `pnpm photos` has not been run yet — the page should
 * render with an empty box, not fail the build. The real file being missing is a
 * broken image, which is visible; making it fatal would block work on the layout.
 */
export function photoPreview(slot: string): Preview | null {
    return previews[slot] ?? null;
}
