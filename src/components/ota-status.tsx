'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BASELINE_RELEASE_VERSION } from '@/lib/ota/baseline';
import { modulesFor } from '@/lib/ota/modules';
import { useOta, type OtaStatus } from '@/lib/ota/provider';

/**
 * A live readout of the content-delivery layer, in the footer.
 *
 * The runtime layer is invisible when it works, which is a problem twice over:
 * a visitor cannot tell a site serving fresh copy from one serving stale copy,
 * and — during a demo — neither can the audience. This makes it legible: which
 * release is on screen, which release the HTML was built from, and which
 * namespaces on THIS route came off the CDN rather than out of the bundle.
 *
 * It is a real diagnostic rather than decoration, so it tells the truth about
 * the boring case: `baseline` means the build already matches the live release
 * and nothing needed fetching. That is the healthy state, not a failure.
 */

const DOT: Record<OtaStatus, string> = {
    baseline: 'bg-sea',
    checking: 'bg-sand-400 animate-pulse',
    live: 'bg-emerald-500',
    unreachable: 'bg-clay',
    disabled: 'bg-sand-400',
};

export function OtaStatusChip() {
    const t = useTranslations('common.ota');
    const { status, releaseVersion, liveModules, refresh } = useOta();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const routeModules = modulesFor(pathname);

    return (
        <div className="text-sm">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs text-ink-soft transition hover:border-sand-400"
            >
                <span
                    aria-hidden
                    className={`h-2 w-2 rounded-full ${DOT[status]}`}
                />
                {t(`status.${status}`)}
                {releaseVersion !== null && (
                    <span className="font-medium text-ink">
                        {t('release', { version: releaseVersion })}
                    </span>
                )}
            </button>

            {open && (
                <dl className="mt-3 grid max-w-md gap-2 rounded-card border border-sand-200 bg-white p-4 text-xs">
                    <div className="flex justify-between gap-4">
                        <dt className="text-sand-600">{t('builtFrom')}</dt>
                        <dd className="text-ink">
                            {BASELINE_RELEASE_VERSION === null
                                ? t('unsynced')
                                : t('release', { version: BASELINE_RELEASE_VERSION })}
                        </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-sand-600">{t('routeModules')}</dt>
                        <dd className="text-ink">{routeModules.join(', ')}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-sand-600">{t('fromCdn')}</dt>
                        <dd className="text-ink">
                            {liveModules.length > 0 ? liveModules.join(', ') : t('none')}
                        </dd>
                    </div>
                    <p className="mt-1 leading-relaxed text-sand-600">{t('explainer')}</p>
                    <div>
                        <button
                            type="button"
                            onClick={refresh}
                            className="mt-1 rounded-full border border-sand-400 px-3 py-1 text-xs font-medium text-ink transition hover:border-ink"
                        >
                            {t('checkNow')}
                        </button>
                    </div>
                </dl>
            )}
        </div>
    );
}
