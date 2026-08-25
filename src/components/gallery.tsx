'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { PhotoSources } from './ui';

export interface GalleryImage extends PhotoSources {
    caption: string;
}

/**
 * A photo gallery with a full-screen viewer.
 *
 * Built on the native `<dialog>` and `showModal()` rather than a hand-rolled
 * overlay, because that is where Escape-to-close, the inert background, the
 * focus trap and the return of focus to the opener already live — all four of
 * which a div-with-a-high-z-index has to reimplement and usually gets wrong for
 * keyboard and screen-reader users.
 *
 * ⚠️ Arrow keys move by ±1 in READING order, and reading order is reversed in
 * RTL. `document.dir` is read at keypress time, not at mount: a runtime language
 * preview flips direction without remounting this component.
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
    const t = useTranslations('common.gallery');
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [index, setIndex] = useState(0);

    const open = (i: number) => {
        setIndex(i);
        dialogRef.current?.showModal();
    };

    const step = useCallback(
        (delta: number) => setIndex((i) => (i + delta + images.length) % images.length),
        [images.length],
    );

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (!dialogRef.current?.open) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            const forward = document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
            step(event.key === forward ? 1 : -1);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [step]);

    const current = images[index]!;

    return (
        <>
            <ul className="grid grid-cols-3 gap-3">
                {images.map((image, i) => (
                    <li key={image.src}>
                        <button
                            type="button"
                            onClick={() => open(i)}
                            className="group block w-full overflow-hidden rounded-card border border-sand-200 bg-sand-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea"
                            style={{
                                aspectRatio: '3 / 2',
                                backgroundImage: image.lqip ? `url("${image.lqip}")` : undefined,
                                backgroundSize: 'cover',
                            }}
                            aria-label={t('open', { caption: image.caption })}
                        >
                            <img
                                src={image.src}
                                srcSet={image.srcSet}
                                sizes="(max-width: 940px) 33vw, 220px"
                                alt={image.alt}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                        </button>
                    </li>
                ))}
            </ul>

            <dialog
                ref={dialogRef}
                onClose={() => setIndex(0)}
                // Clicking the backdrop closes. The check is "the click landed on
                // the dialog element itself", which for a dialog whose content is
                // a child element only happens on the backdrop.
                onClick={(event) => {
                    if (event.target === dialogRef.current) dialogRef.current?.close();
                }}
                className="m-auto w-[min(94vw,1100px)] rounded-card bg-transparent p-0 backdrop:bg-ink/80"
            >
                <figure className="overflow-hidden rounded-card bg-white">
                    <img
                        src={current.src}
                        srcSet={current.srcSet}
                        sizes="min(94vw, 1100px)"
                        alt={current.alt}
                        className="max-h-[70vh] w-full object-contain bg-ink"
                    />
                    <figcaption className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <span className="text-sm text-ink">{current.caption}</span>
                        <span className="flex items-center gap-2">
                            <span className="me-2 text-xs text-sand-600">
                                {t('position', { index: index + 1, total: images.length })}
                            </span>
                            <NavButton onClick={() => step(-1)} label={t('previous')}>
                                {/* Mirrors in RTL: this arrow encodes a direction. */}
                                <span className="inline-block rtl:-scale-x-100">←</span>
                            </NavButton>
                            <NavButton onClick={() => step(1)} label={t('next')}>
                                <span className="inline-block rtl:-scale-x-100">→</span>
                            </NavButton>
                            <NavButton
                                onClick={() => dialogRef.current?.close()}
                                label={t('close')}
                            >
                                ✕
                            </NavButton>
                        </span>
                    </figcaption>
                </figure>
            </dialog>
        </>
    );
}

function NavButton({
    onClick,
    label,
    children,
}: {
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-200 text-ink transition hover:border-ink"
        >
            {children}
        </button>
    );
}
