# Wanderlane — Next.js reference integration for TextSetu

A working, deployable travel site that shows how to wire a real website to
[TextSetu](https://textsetu.com) content delivery. Nothing here is hacked in for
the demo: the same shapes run textsetu.com in production.

**Wanderlane is a fictional brand.** Nothing is bookable, no payment is taken and
no real property is described.

> Its sibling, [`wanderlane-react`](https://github.com/TextSetu/wanderlane-react),
> is the same brand as a Vite SPA where a newly published language appears with
> **no rebuild at all**. The two answer different questions; see *Which one do I
> want?* below.

- **Live:** https://demo1.textsetu.com
- **Stack:** Next.js 15 (App Router, `output: 'export'`), next-intl, Tailwind v4
- **Hosting:** GitHub Pages

---

## What this demonstrates

| | |
| --- | --- |
| **Copy updates with no deploy** | Edit a string in TextSetu, publish, and it is live here in about a minute. The build-time catalogue is the floor, not the ceiling. |
| **A language switcher driven by live data** | Labels, flags, direction and order all come from the manifest's `languageDetails`. There is no hardcoded locale array anywhere in `src/components/`. |
| **Per-route translation loading** | The distribution is split by module and `modulesFor()` fetches only the namespaces the current route renders. |
| **Right-to-left, properly** | `dir` is in the served HTML per locale, not applied by script afterwards, so there is no reflow on load. |
| **Degrading safely** | A CDN outage, a 429, a rebuilding distribution or a total network failure all fall back to copy that is already on the page. |
| **A CI localization loop** | Sources are pushed on merge; approved translations come back as a reviewable PR; an incomplete language fails the build. |

## Which one do I want?

A statically exported site prerenders one route per locale, so a **newly added
language** needs a rebuild before it has a page. That is not a limitation of
TextSetu — it is what static export means.

- Copy changes to an **existing** language: live in ~60s, no rebuild. Both repos.
- A **new language**: this repo needs a rebuild (automated, see below).
  `wanderlane-react` does not, because an SPA has no per-locale routes to build.

Pick this one if you need SEO, `hreflang` and prerendered HTML. Pick the React one
if you need any published language to appear instantly.

---

## How it works

### Three layers

```
build time   scripts/sync-translations.mjs
             ├─ messages/<locale>.json          inlined into the prerendered HTML
             ├─ src/i18n/locales.generated.json which locales get routes
             └─ src/lib/ota/baseline.ts         the release hash that copy came from

first paint  the prerendered HTML, from the baseline. No fetch, no flash.

runtime      src/lib/ota/provider.tsx
             fetch the manifest → same hash as the baseline? stop.
                                → different? fetch only this route's modules.
```

The common case costs **one manifest request and zero blob requests**: a freshly
deployed site's baseline already matches the live release.

### The language switcher, and the honest edge case

`src/components/language-switcher.tsx` renders from the **live manifest**. When
the manifest lists a language this build has no route for — published, not yet
deployed — that entry is rendered as a `<button>`, never an `<a>`:

- no `href`, so it is structurally incapable of 404ing;
- inert with JavaScript off, which is honest — there is genuinely nothing we can
  do for that language without one;
- clicking it enters **preview mode**, swapping the copy client-side.

Preview emits no `hreflang`, no sitemap entry, and leaves the canonical URL clean.
**It is worth exactly zero SEO** — the served bytes still say `lang="en"`. That is
not a flaw being hidden; it is the argument for the rebuild loop below.

### Keeping the deployed HTML fresh

`.github/workflows/deploy.yml` rebuilds on push, on a 6-hourly schedule, on
`workflow_dispatch`, and on a `repository_dispatch` of type `textsetu-release`.

> **A TextSetu webhook cannot yet call GitHub's dispatch API directly.** GitHub
> requires an `Authorization: Bearer` header and a `{"event_type": …}` body;
> TextSetu endpoints currently send neither a custom header nor a templated body,
> so the call would 401 and then 422. Worse, TextSetu classifies a 4xx as
> permanent and auto-disables an endpoint after ten of them — so pointing one at
> GitHub today does not merely fail, it bricks the endpoint.
>
> Until custom headers and payload templates ship, the **schedule** is the
> working trigger and `workflow_dispatch` is the "publish it live now" button.

---

## Running it

```bash
pnpm install
pnpm dev                      # http://localhost:3020

pnpm build                    # pulls published copy first, then builds
OTA_SKIP_SYNC=1 pnpm build    # build against exactly what is committed
pnpm check                    # typecheck + the two lint guards below
pnpm placeholders             # regenerate the placeholder imagery
```

### Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_OTA_MANIFEST_URL` | The distribution's manifest. Copy it from **Project → Manage → Content delivery**. |
| `NEXT_PUBLIC_OTA_DISABLED=true` | Serve exactly what was built. Useful for a bisect. Does **not** mean untranslated. |
| `NEXT_PUBLIC_OTA_DEBUG=true` | Log what the OTA layer decided. On by default in dev. |
| `NEXT_PUBLIC_SITE_ORIGIN` | Canonical origin. Defaults to `https://demo1.textsetu.com`. |
| `NEXT_PUBLIC_BASE_PATH` | Only for a fork served from `<user>.github.io/<repo>/`. Mutually exclusive with `public/CNAME`. |
| `OTA_SKIP_SYNC=1` | Build offline against the committed catalogues. |

**Turn `NEXT_PUBLIC_OTA_DEBUG` on the first time.** The healthy outcome and a
completely broken integration look identical in the network tab — both are "no
blob requests". The log is how you tell them apart.

---

## Setting it up against your own TextSetu project

1. Create a project and add your languages. `en` is the source here.
2. Create a **distribution**: format `i18next`, **split by module ON**.
   Splitting is what makes per-route fetching possible; without it every page
   downloads every namespace.
3. Publish, then copy the manifest URL into `NEXT_PUBLIC_OTA_MANIFEST_URL` and
   into `MANIFEST_URL` in `scripts/sync-translations.mjs`.
4. Point a delivery target at your own bucket, and configure **both** the CDN
   response-headers policy **and** the bucket's CORS rules. A response-headers
   policy decorates real responses but cannot synthesize a preflight, and
   `If-None-Match` is not CORS-safelisted — with only one of the two, publishing
   reports success while every browser fetch fails.
5. Set `projectId` in `textsetu.json` and add a **project token** (`tsu_proj_…`)
   as the `TEXTSETU_API_KEY` repository secret.
6. Enable *Settings → Actions → Allow GitHub Actions to create and approve pull
   requests*, or the translations PR cannot be opened.

---

## Things that will bite you

Each of these cost real time to find. They are commented at the site of the fix.

- **The ETag is not the content hash.** `files[].contentHash` is `sha256:<hex>`;
  the `ETag` header is bare hex identifying the *manifest document*, not the
  release content. `etag === contentHash.slice(7)` is permanently false and looks
  exactly like "the cache never hits". See `src/lib/ota/baseline.ts`.
- **`202` is `res.ok`.** A distribution mid-publish answers
  `202 {"status":"building"}`, which passes an `if (!res.ok)` guard and then
  destructures `undefined`. See `readManifest()` in `scripts/sync-translations.mjs`.
- **`trailingSlash: true` is mandatory.** With `false`, Pages serves
  `out/stays.html` at `/stays.html` and *not* at `/stays`. There is no server
  config to fix it with.
- **The 404 must be `src/app/not-found.tsx`, at the app root.** A static export
  never routes an unmatched URL through Next; Pages reads `/404.html` off disk. A
  `not-found.tsx` inside `[locale]` only covers build-time `notFound()` calls.
  `flatten-default-locale.mjs` asserts the shipped file is ours.
- **`useSearchParams()` is banned.** Under `output: 'export'` it returns empty at
  prerender and forces a Suspense boundary, or the build fails. Preview mode reads
  `window.location.search` in an effect instead.
- **`basePath` does not touch raw `<a href>` or `<img src>`.** Next prefixes it
  for `next/link` and `next/image` only. `scripts/check-base-path.mjs` fails the
  build on anything that skipped `withBase()`.
- **RTL cannot be retrofitted.** `scripts/check-rtl.mjs` rejects physical
  directional utilities (`ml-`, `pr-`, `left-`, `text-right`, …). Adding it after
  the fact means a full restyling pass.
- **A fork PR has no secrets**, so `i18n-gate` is guarded by an `if:` — otherwise
  every outside contribution fails with a misleading auth error.
- **A static export needs an explicit `timeZone`.** Without a global default,
  next-intl formats dates in the *rendering environment's* zone — the build
  runner's during export, the visitor's during hydration. They disagree, and the
  result is a hydration mismatch. next-intl flags it as an `ENVIRONMENT_FALLBACK`
  error on every server render. See `SITE_TIME_ZONE` in `src/lib/site.ts`; note
  the hand-constructed `NextIntlClientProvider` in `ota/provider.tsx` needs it
  passed explicitly, because it does not inherit the server config.

## Known trade-offs

- **The build-time baseline inlines every namespace, not just the route's.**
  next-intl's provider receives the whole catalogue in the layout, so the
  prerendered HTML carries all of it (~18 KB). The *runtime* fetch is correctly
  split per route — the split saves network on updates, not on first paint.
  Fixing it means threading per-route message subsets through every page.
- **Only `en` and `fr` are committed.** Translations are owned by TextSetu, not
  authored here; `src/i18n/request.ts` falls back to the source language for a
  locale with no committed file. Run `pnpm sync-translations` to pull the rest.
- **The photographs are placeholder gradients.** Replace `public/img/**` with
  licensed imagery at the same paths and widths, and record each file in
  `content/credits.json`.

## Licence

MIT. See `LICENSE`.
