/**
 * The manifest contract, as published by TextSetu content delivery.
 *
 * Mirrors `textsetu.distribution/v1`. Hand-written rather than generated: this
 * is the entire public surface of the read path, it is small, and the SDK's
 * `getContentManifest` is currently typed `unknown` — so there is nothing to
 * generate from. If it grows, generate it from the OpenAPI spec instead.
 */

export interface OtaFile {
    language: string;

    /**
     * The message namespace this file carries.
     *
     * ⚠️ NULLABLE. `null` means the distribution is not split by module and the
     * file is the whole locale document. Wanderlane's distribution IS split, so
     * null never appears in practice — but this repo is meant to be copied, and
     * the reader's distribution may not be.
     */
    module: string | null;

    /** Logical filename (`fr/stays.json`). NOT part of the URL. */
    path: string;

    /** Absolute, content-addressed, served `immutable`. Never construct it. */
    url: string;

    /** `sha256:<hex>` over the file's bytes. */
    contentHash: string;

    byteSize: number;
    contentType: string;
}

export interface OtaLanguage {
    code: string;
    label: string;
    icon: string | null;
    direction: 'ltr' | 'rtl';
}

export interface OtaManifest {
    schema: string;
    distribution: { key: string; name: string; channel: string };
    release: {
        id: string;
        version: number;
        /** `sha256:<hex>` over the whole release. The change-detection key. */
        contentHash: string;
        publishedAt: string;
    };
    project: { id: string; sourceLanguage: string | null };
    format: { id: string; keySeparator: string; extension: string };
    languages: string[];

    /**
     * ⚠️ OPTIONAL. The field is additive and is absent on releases published
     * before it existed, so every read must fall back to `languages`.
     */
    languageDetails?: OtaLanguage[];

    files: OtaFile[];

    /** Reserved by the schema; always null / empty in v1. */
    minAppVersion: string | null;
    maxAppVersion: string | null;
    bundles: unknown[];
}

/** A namespace's messages, keyed by module name. */
export type OtaMessages = Record<string, unknown>;

/**
 * A 200 carrying something that is not a manifest is likelier to be an S3 error
 * document or a captive portal than a schema change, so this is a guard, not a
 * validator. Shared with the build-time sync script via the same rules.
 */
export function isManifest(value: unknown): value is OtaManifest {
    if (typeof value !== 'object' || value === null) return false;
    const m = value as Partial<OtaManifest>;
    return (
        typeof m.schema === 'string' &&
        m.schema.startsWith('textsetu.distribution/') &&
        typeof m.release?.contentHash === 'string' &&
        Array.isArray(m.files) &&
        Array.isArray(m.languages)
    );
}
