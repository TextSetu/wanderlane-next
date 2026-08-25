/**
 * The one place `basePath` is applied to a hand-written URL.
 *
 * Next prefixes `basePath` automatically for `next/link`, `next/image` and
 * `router.push` — and for NOTHING else. This codebase navigates with plain
 * `<a href>` and renders plain `<img src>` (the house style; see the marketing
 * site), so every one of those would 404 under a GitHub Pages project path
 * such as `/wanderlane-next/`.
 *
 * `demo1.textsetu.com` is a custom domain, so `BASE_PATH` is '' in our own
 * deployment and none of this is load-bearing for us. It exists because this
 * repo is meant to be forked, and a fork served from
 * `<user>.github.io/<repo>/` needs exactly this. `scripts/check-base-path.mjs`
 * fails the build if a raw absolute URL slips past the helper.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prefix an absolute in-repo path. Relative and external URLs pass through. */
export function withBase(path: string): string {
    return path.startsWith('/') ? `${BASE_PATH}${path}` : path;
}
