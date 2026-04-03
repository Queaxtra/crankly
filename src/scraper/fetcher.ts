import { baseUrl, maxHtmlBytes, requestDelayMs, requestTimeoutMs, retryCount, userAgent } from "../config/constants.ts";
import { CranklyError, NotFoundError } from "../lib/errors.ts";
import { TtlCache } from "./cache.ts";

const sleep = (ms: number) => Bun.sleep(ms);

class RequestScheduler {
  private queue = Promise.resolve();
  private lastRunAt = 0;

  async run<T>(task: () => Promise<T>): Promise<T> {
    const nextTask = this.queue.then(async () => {
      const waitMs = requestDelayMs - (Date.now() - this.lastRunAt);

      if (waitMs > 0) {
        await sleep(waitMs);
      }

      this.lastRunAt = Date.now();
      return task();
    });

    this.queue = nextTask.then(() => undefined, () => undefined);
    return nextTask;
  }
}

export class HtmlFetcher {
  private readonly cache = new TtlCache<string>();
  private readonly scheduler = new RequestScheduler();

  async get(relativePath: string, ttlMs: number): Promise<string> {
    const url = this.buildUrl(relativePath);
    const cached = this.cache.get(url);

    if (cached) {
      return cached;
    }

    const html = await this.fetchWithRetry(url);
    this.cache.set(url, html, ttlMs);
    return html;
  }

  private buildUrl(relativePath: string): string {
    const normalizedPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

    if (normalizedPath.includes("..")) {
      throw new CranklyError("Unsafe path rejected.", "INVALID_PATH", 400);
    }

    const url = new URL(normalizedPath, baseUrl);

    if (url.origin !== baseUrl) {
      throw new CranklyError("Cross-origin path rejected.", "INVALID_PATH", 400);
    }

    return url.toString();
  }

  private async fetchWithRetry(url: string): Promise<string> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt < retryCount) {
      attempt += 1;

      try {
        return await this.scheduler.run(() => this.fetchOnce(url));
      } catch (error) {
        lastError = error;

        if (error instanceof NotFoundError) {
          throw error;
        }

        if (attempt >= retryCount) {
          break;
        }

        await sleep(2 ** (attempt - 1) * 1000);
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new CranklyError("Request failed.", "FETCH_FAILED", 502);
  }

  private async fetchOnce(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": userAgent,
          "accept-language": "en-US,en;q=0.9",
          accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      if (response.status === 404) {
        throw new NotFoundError(`StartMyCar page not found: ${url}`);
      }

      if (!response.ok) {
        throw new CranklyError(`StartMyCar responded with ${response.status}.`, "HTTP_ERROR", response.status);
      }

      const buffer = await response.arrayBuffer();

      if (buffer.byteLength > maxHtmlBytes) {
        throw new CranklyError("Remote page exceeded the safe size limit.", "RESPONSE_TOO_LARGE", 502);
      }

      return new TextDecoder().decode(buffer);
    } catch (error) {
      if (error instanceof CranklyError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new CranklyError("Request timed out.", "TIMEOUT", 504);
      }

      if (error instanceof Error) {
        throw new CranklyError(error.message, "NETWORK_ERROR", 502);
      }

      throw new CranklyError("Unexpected fetch failure.", "NETWORK_ERROR", 502);
    } finally {
      clearTimeout(timeout);
    }
  }
}
