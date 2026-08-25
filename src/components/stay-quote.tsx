'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';

import { bookingCurrency, stayFacts, staySlugs } from '@/lib/site';
import { DateInput, Field, Select, Stepper } from './controls';

/**
 * An indicative quote.
 *
 * This is the widget the booking page is built around, because it is where an
 * i18n bug is most expensive and least visible. Four separate things have to be
 * right at once, and only one of them is a translated string:
 *
 *  - the DATES are formatted by `Intl`, so `12 April 2027` becomes `12 avril
 *    2027` and `٢٠٢٧/٤/١٢` without anyone translating a month name;
 *  - the MONEY is `Intl.NumberFormat` with a currency CODE, so the symbol,
 *    the separators and the side the symbol sits on all follow the reader's
 *    locale rather than ours;
 *  - the COUNTS take the locale's plural rule — Arabic has six categories, so a
 *    catalogue with only `one`/`other` is visibly wrong there and nowhere else;
 *  - only the SENTENCES are strings from TextSetu.
 *
 * Nothing here is charged. The disclaimer under it is a real string in the
 * catalogue, which is the point: it is exactly the kind of line a property
 * rewrites on a Friday afternoon.
 */

const DEFAULT_ARRIVAL = '2027-04-12';
const MS_PER_NIGHT = 86_400_000;
const DEPOSIT_RATE = 0.2;

export function StayQuote() {
    const t = useTranslations('booking.quote');
    const s = useTranslations('stays');
    const format = useFormatter();

    const [stay, setStay] = useState<string>(staySlugs[0]!);
    const [arrival, setArrival] = useState(DEFAULT_ARRIVAL);
    const [nights, setNights] = useState(5);
    const [guests, setGuests] = useState(2);

    const facts = stayFacts[stay as keyof typeof stayFacts];
    const arrivalDate = new Date(`${arrival}T12:00:00Z`);
    const valid = !Number.isNaN(arrivalDate.getTime());
    const departureDate = new Date(arrivalDate.getTime() + nights * MS_PER_NIGHT);

    const subtotal = facts.nightly * nights;
    const deposit = Math.round(subtotal * DEPOSIT_RATE);
    const balance = subtotal - deposit;

    const money = (amount: number) =>
        format.number(amount, { style: 'currency', currency: bookingCurrency });

    // The one rule the widget enforces, and it is a FACT about the house rather
    // than a policy: a place that sleeps four cannot sleep six.
    const overCapacity = guests > facts.sleeps;

    return (
        <div className="rounded-card border border-sand-200 bg-white p-6 shadow-card">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('stay')} htmlFor="quote-stay">
                    <Select id="quote-stay" value={stay} onChange={setStay}>
                        {staySlugs.map((slug) => (
                            <option key={slug} value={slug}>
                                {s(`items.${slug}.name`)}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label={t('arrival')} htmlFor="quote-arrival">
                    <DateInput id="quote-arrival" value={arrival} onChange={setArrival} />
                </Field>

                <Field label={t('nights')}>
                    <Stepper
                        value={nights}
                        min={2}
                        max={21}
                        onChange={setNights}
                        decreaseLabel={t('fewerNights')}
                        increaseLabel={t('moreNights')}
                    >
                        {t('nightCount', { count: nights })}
                    </Stepper>
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

            {overCapacity && (
                <p className="mt-4 rounded-lg border border-clay/40 bg-clay/5 px-3 py-2 text-sm text-clay">
                    {t('overCapacity', { count: facts.sleeps })}
                </p>
            )}

            <dl className="mt-6 space-y-2 border-t border-sand-200 pt-5 text-sm">
                <Row
                    label={t('dates')}
                    value={
                        valid
                            ? format.dateTimeRange(arrivalDate, departureDate, {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : t('invalidDate')
                    }
                />
                <Row
                    label={t('rate', { amount: money(facts.nightly) })}
                    value={money(subtotal)}
                />
                <Row label={t('depositDue')} value={money(deposit)} strong />
                <Row label={t('balanceDue')} value={money(balance)} />
            </dl>

            <p className="mt-5 text-xs leading-relaxed text-sand-600">{t('disclaimer')}</p>
        </div>
    );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-soft">{label}</dt>
            <dd className={strong ? 'font-semibold text-ink' : 'text-ink'}>{value}</dd>
        </div>
    );
}
