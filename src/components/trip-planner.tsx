'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';

import { localeHref } from '@/i18n/routing';
import { destinationPath, destinationSlugs, destinationMonths } from '@/lib/site';
import { DateInput, Field, Select, Stepper } from './controls';

/**
 * The hero's trip planner.
 *
 * It books nothing — this is a demonstration site — and that is deliberate: what
 * it exists to show is that *localization reaches the interactive parts of a
 * product too*. Change the language and the month names, the date, the guest
 * count's plural form and the digits themselves all change, because none of them
 * is a string anyone typed into a catalogue. Only the sentence around them is.
 *
 * ⚠️ Every default here is a CONSTANT, never `new Date()` or a browser locale.
 * This component is prerendered into the static HTML at build time and then
 * hydrated in the reader's browser; a default derived from "now" or from
 * `navigator` differs between those two moments and hydration mismatches.
 */

/** Arbitrary, fixed, and in the future for the life of the demo. */
const DEFAULT_ARRIVAL = '2027-04-12';

export function TripPlanner({ locale }: { locale: string }) {
    const t = useTranslations('home.planner');
    const d = useTranslations('destinations');
    const format = useFormatter();

    const [destination, setDestination] = useState<string>(destinationSlugs[0]);
    const [arrival, setArrival] = useState(DEFAULT_ARRIVAL);
    const [guests, setGuests] = useState(2);

    // Parsed as UTC, matching SITE_TIME_ZONE. `new Date('2027-04-12')` is
    // already UTC per spec, but the explicit instant says so at the call site
    // rather than relying on a rule people misremember.
    const arrivalDate = new Date(`${arrival}T12:00:00Z`);
    const valid = !Number.isNaN(arrivalDate.getTime());

    const months = destinationMonths[destination as keyof typeof destinationMonths] ?? [];
    const monthNames = months.map((m) =>
        format.dateTime(new Date(Date.UTC(2027, m, 1)), { month: 'long' }),
    );

    return (
        <div className="rounded-card border border-sand-200 bg-white/95 p-5 shadow-card backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t('destination')} htmlFor="planner-destination">
                    <Select id="planner-destination" value={destination} onChange={setDestination}>
                        {destinationSlugs.map((slug) => (
                            <option key={slug} value={slug}>
                                {d(`items.${slug}.name`)}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label={t('arrival')} htmlFor="planner-arrival">
                    <DateInput id="planner-arrival" value={arrival} onChange={setArrival} />
                </Field>

                <Field label={t('guests')}>
                    <Stepper
                        value={guests}
                        min={1}
                        max={8}
                        onChange={setGuests}
                        decreaseLabel={t('fewerGuests')}
                        increaseLabel={t('moreGuests')}
                    >
                        {t('guestCount', { count: guests })}
                    </Stepper>
                </Field>
            </div>

            <p className="mt-4 text-sm text-ink-soft">
                {valid
                    ? t('summary', {
                          city: d(`items.${destination}.name`),
                          date: format.dateTime(arrivalDate, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                          }),
                          count: guests,
                      })
                    : t('invalidDate')}
            </p>

            {monthNames.length > 0 && (
                <p className="mt-1.5 text-xs text-sand-600">
                    {t('bestMonths', { months: format.list(monthNames, { type: 'conjunction' }) })}
                </p>
            )}

            <a
                href={localeHref(locale, destinationPath(destination as never))}
                className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-sand-50 transition hover:bg-ink-soft"
            >
                {t('cta', { city: d(`items.${destination}.name`) })}
            </a>
        </div>
    );
}
