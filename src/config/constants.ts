import type { CountryCode } from "../types/index.ts";

export const defaultCountry: CountryCode = "us";
export const baseUrl = "https://www.startmycar.com";
export const userAgent = "crankly/0.1.0 (+https://www.startmycar.com)";
export const requestTimeoutMs = 10_000;
export const requestDelayMs = 500;
export const retryCount = 3;
export const maxHtmlBytes = 2_000_000;
export const cacheMaxEntries = 512;
export const allowedManualHosts = new Set([
  "manuals.startmycar.com",
  "manuals.opinautos.com",
  "startmycar-manuals.s3.amazonaws.com",
]);
export const cacheTtlMs = {
  catalog: 24 * 60 * 60 * 1000,
  data: 60 * 60 * 1000,
  guides: 6 * 60 * 60 * 1000,
} as const;
