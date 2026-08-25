import { withBase } from '@/lib/base-path';

/**
 * Under `output: 'export'` there is no image optimiser, so `<picture>` is
 * hand-rolled: two committed widths per image, explicit dimensions to avoid
 * layout shift, and every src through `withBase()`.
 */
export function Picture({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
}: {
    /** Path without extension, e.g. `/img/destinations/kyoto-hero`. */
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
}) {
    return (
        <img
            src={withBase(`${src}-1200.webp`)}
            srcSet={`${withBase(`${src}-600.webp`)} 600w, ${withBase(`${src}-1200.webp`)} 1200w`}
            sizes="(max-width: 940px) 100vw, 50vw"
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={className}
        />
    );
}

export function Section({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <section className={`mx-auto w-full max-w-6xl px-5 py-14 ${className}`}>{children}</section>;
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
