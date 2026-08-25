'use client';

/**
 * The small form controls the interactive widgets share.
 *
 * ⚠️ Every one of these is direction-agnostic: `ms/me`, `start/end`, and a
 * stepper whose − and + are laid out by flex order rather than by absolute
 * position. In RTL the whole control mirrors with no extra CSS, which is the
 * only way this stays correct as pages are added — `pnpm check:rtl` greps for
 * the physical properties that would break it.
 */

export function Field({
    label,
    htmlFor,
    children,
}: {
    label: string;
    htmlFor?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={htmlFor}
                className="text-xs font-medium uppercase tracking-wide text-sand-600"
            >
                {label}
            </label>
            {children}
        </div>
    );
}

const CONTROL =
    'w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-ink transition focus:border-sea focus:outline-none focus:ring-2 focus:ring-sea/30';

export function Select({
    id,
    value,
    onChange,
    children,
}: {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={CONTROL}
        >
            {children}
        </select>
    );
}

export function DateInput({
    id,
    value,
    onChange,
    min,
}: {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    min?: string;
}) {
    return (
        <input
            id={id}
            type="date"
            value={value}
            min={min}
            onChange={(e) => onChange(e.target.value)}
            className={CONTROL}
        />
    );
}

/**
 * A −/+ stepper.
 *
 * The value is a NUMBER rendered by the caller through `Intl`, not by
 * `toString()` — Arabic-Indic digits are the default numbering system for `ar`
 * in several regions, and a hand-stringified count would silently opt out of it
 * while the plural noun beside it did not.
 */
export function Stepper({
    id,
    value,
    min,
    max,
    onChange,
    decreaseLabel,
    increaseLabel,
    children,
}: {
    id?: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    decreaseLabel: string;
    increaseLabel: string;
    /** The formatted value. */
    children: React.ReactNode;
}) {
    const button =
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sand-200 bg-white text-lg leading-none text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-40';

    return (
        <div id={id} className="flex items-center gap-2">
            <button
                type="button"
                className={button}
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                aria-label={decreaseLabel}
            >
                −
            </button>
            <span className="min-w-24 text-center text-sm text-ink" aria-live="polite">
                {children}
            </span>
            <button
                type="button"
                className={button}
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                aria-label={increaseLabel}
            >
                +
            </button>
        </div>
    );
}
