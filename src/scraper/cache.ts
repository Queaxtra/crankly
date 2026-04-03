import { cacheMaxEntries } from "../config/constants.ts";

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

export class TtlCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();

  get(key: string): T | undefined {
    this.pruneExpired();
    const entry = this.entries.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.pruneExpired();
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    this.pruneOverflow();
  }

  private pruneExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.entries) {
      if (entry.expiresAt > now) {
        continue;
      }

      this.entries.delete(key);
    }
  }

  private pruneOverflow(): void {
    if (this.entries.size <= cacheMaxEntries) {
      return;
    }

    const overflowCount = this.entries.size - cacheMaxEntries;
    const oldestKeys = [...this.entries.keys()].slice(0, overflowCount);

    for (const key of oldestKeys) {
      this.entries.delete(key);
    }
  }
}
