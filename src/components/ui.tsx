import { withBase } from '@/lib/base-path';
import { photoPreview } from '@/lib/photos';

/** Aspect ratios, mirroring `ratioFor()` in scripts/fetch-photos.mjs. */
const RATIO = {
    banner: '21 / 9',
    hero: '15 / 8',
    card: '3 / 2',
} as const;

export type PhotoShape = keyof typeof RATIO;

/**
 * Under `output: 'export'` there is no image optimiser, so `<picture>` is
 * hand-rolled: committed widths per image, explicit dimensions to reserve the
 * box, and every src through `withBase()`.
 *
 * The 24px preview is painted as the WRAPPER'S BACKGROUND, not as a second
 * `<img>` that fades out. A background costs no JavaScript, cannot race
 * hydration, and is covered by the real photo the instant it decodes — so a slow
 * connection sees the shape and colour of the image rather than an empty box,
 * and nothing moves when it arrives.
 */
export function Picture({
    slot,
    alt,
    shape,
    widths = [600, 1200],
    sizes = '(max-width: 940px) 100vw, 50vw',
    priority = false,
    className = '',
    imgClassName = '',
}: {
    /** A slot from content/photos.json, e.g. `destinations/kyoto-hero`. */
    slot: string;
    alt: string;
    shape: PhotoShape;
    widths?: number[];
    sizes?: string;
    priority?: boolean;
    /** Applied to the wrapper — that is what carries the rounding and the crop. */
    className?: string;
    /** Applied to the `<img>`. Use for the hover transform, not for layout. */
    imgClassName?: string;
}) {
    const preview = photoPreview(slot);
    const widest = widths.at(-1) ?? 1200;
    const src = withBase(`/img/${slot}-${widest}.webp`);

    return (
        <div
            className={`relative overflow-hidden bg-sand-100 ${className}`}
            style={{
                aspectRatio: RATIO[shape],
                backgroundImage: preview ? `url("${preview.lqip}")` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <img
                src={src}
                srcSet={widths
                    .map((w) => `${withBase(`/img/${slot}-${w}.webp`)} ${w}w`)
                    .join(', ')}
                sizes={sizes}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className={`h-full w-full object-cover ${imgClassName}`}
            />
        </div>
    );
}

const PAD = {
    default: 'py-14',
    top: 'pt-16 pb-14',
    tight: 'pt-10 pb-14',
    bottom: 'pt-0 pb-14',
    none: 'py-0',
} as const;

/**
 * The page's horizontal rhythm.
 *
 * ⚠️ Padding and width are PROPS, not classes the caller appends. Two Tailwind
 * utilities that set the same property — `py-14` from here and a `py-0` passed
 * in — have identical specificity, so which one wins is decided by their order
 * in the generated stylesheet rather than by the order in the class attribute.
 * That is a coin flip that changes when an unrelated file adds a class, and it
 * is invisible until a section is silently twice as tall as its neighbour.
 */
export function Section({
    children,
    className = '',
    width = 'default',
    pad = 'default',
}: {
    children: React.ReactNode;
    className?: string;
    width?: 'default' | 'narrow';
    pad?: keyof typeof PAD;
}) {
    return (
        <section
            className={`mx-auto w-full px-5 ${
                width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl'
            } ${PAD[pad]} ${className}`}
        >
            {children}
        </section>
    );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sea">{children}</p>
    );
}

export function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`overflow-hidden rounded-card border border-sand-200 bg-white shadow-card ${className}`}
        >
            {children}
        </div>
    );
}

/**
 * A card that is entirely a link. `group` is what lets the photo inside react to
 * a hover on the whole card — see the `group-hover:scale-105` at the call sites.
 */
export function LinkCard({
    href,
    children,
    className = '',
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <a
            href={href}
            className={`group block overflow-hidden rounded-card border border-sand-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-sand-400 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea ${className}`}
        >
            {children}
        </a>
    );
}

/** A small labelled fact. Used for the "at a glance" strips. */
export function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-card border border-sand-200 bg-white px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-sand-600">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
        </div>
    );
}

export interface PhotoSources {
    src: string;
    srcSet: string;
    lqip: string | null;
    alt: string;
}

/**
 * Resolve a slot to the attributes an `<img>` needs.
 *
 * Exists so a CLIENT component can render a committed photo without importing
 * `content/photos.generated.json` — every preview in the file would then be in
 * the browser bundle, including the fifty-odd this page does not show. The
 * server resolves the handful it needs and passes them down as props.
 */
export function photoSources(
    slot: string,
    alt: string,
    widths: number[] = [600, 1200],
): PhotoSources {
    return {
        src: withBase(`/img/${slot}-${widths.at(-1) ?? 1200}.webp`),
        srcSet: widths.map((w) => `${withBase(`/img/${slot}-${w}.webp`)} ${w}w`).join(', '),
        lqip: photoPreview(slot)?.lqip ?? null,
        alt,
    };
}
