updated: 2026-03-03

## What we aim for

WCAG 2.2 AA. Every interactive control is reachable by keyboard, the language
switcher is a real listbox, and the document language and direction are set in
the served HTML rather than applied afterwards by script.

## Right-to-left

Arabic is served with `dir="rtl"` at build time, so there is no reflow on load.
Layout uses logical CSS properties throughout, which is enforced in CI.

## Known gaps

Photography carries translated alternative text, but decorative imagery is not
yet consistently marked as such.
