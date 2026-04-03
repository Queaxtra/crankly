import { cacheTtlMs, defaultCountry } from "../config/constants.ts";
import { CranklyError, NotFoundError } from "../lib/errors.ts";
import type { ComparisonResult, CountryCode, Fuse, Guide, Make, Manual, Model, Problem, Review } from "../types/index.ts";
import { HtmlFetcher } from "../scraper/fetcher.ts";
import {
  parseFuseboxReferences,
  parseGuideDetail,
  parseGuideList,
  parseMakes,
  parseManualList,
  parseModels,
  parseOwnerManualDetail,
  parseServiceRepairManuals,
} from "../scraper/parsers/catalog.ts";
import { parseComparison, parseProblemDetail, parseProblemSummaries, parseReviews } from "../scraper/parsers/community.ts";
import { parseFusebox } from "../scraper/parsers/fusebox.ts";

const sortByYearDesc = <T extends { year: number }>(items: T[]): T[] => [...items].sort((left, right) => right.year - left.year);

export class StartMyCarService {
  constructor(private readonly fetcher: HtmlFetcher) {}

  async listMakes(country = defaultCountry): Promise<Make[]> {
    try {
      const html = await this.fetcher.get(`/${country}/pickmake`, cacheTtlMs.catalog);
      return parseMakes(html);
    } catch (error) {
      throw this.toServiceError(error, "Failed to list makes.");
    }
  }

  async listModels(make: string, country = defaultCountry): Promise<Model[]> {
    try {
      const pickModelPath = `/${country}/${make}/pickmodel`;
      const html = await this.fetcher.get(pickModelPath, cacheTtlMs.catalog);
      const models = parseModels(html, country, make);

      if (models.length > 0) {
        return models;
      }

      const fallbackHtml = await this.fetcher.get(`/${country}/${make}`, cacheTtlMs.catalog);
      return parseModels(fallbackHtml, country, make);
    } catch (error) {
      throw this.toServiceError(error, `Failed to list models for ${make}.`);
    }
  }

  async getProblems(make: string, model: string, page = 1, country = defaultCountry): Promise<Problem[]> {
    try {
      const suffix = page > 1 ? `/page${page}` : "";
      const listHtml = await this.fetcher.get(`/${country}/${make}/${model}/problems${suffix}`, cacheTtlMs.data);
      const summaries = parseProblemSummaries(listHtml);
      const problems: Problem[] = [];

      for (const summary of summaries) {
        try {
          const detailHtml = await this.fetcher.get(summary.detailPath, cacheTtlMs.data);
          const detail = parseProblemDetail(detailHtml);
          problems.push({
            title: detail.title || summary.title,
            description: detail.description || summary.description,
            votes: detail.votes,
            solutions: detail.solutions,
            author: detail.author || summary.author,
            date: detail.date || summary.date,
          });
        } catch (error) {
          if (error instanceof NotFoundError) {
            problems.push({
              title: summary.title,
              description: summary.description,
              votes: 0,
              solutions: [],
              author: summary.author,
              date: summary.date,
            });
            continue;
          }

          throw error;
        }
      }

      return problems;
    } catch (error) {
      throw this.toServiceError(error, `Failed to load problems for ${make} ${model}.`);
    }
  }

  async getReviews(make: string, model: string, country = defaultCountry): Promise<Review[]> {
    try {
      const html = await this.fetcher.get(`/${country}/${make}/${model}/reviews`, cacheTtlMs.data);
      return parseReviews(html);
    } catch (error) {
      throw this.toServiceError(error, `Failed to load reviews for ${make} ${model}.`);
    }
  }

  async getFuseBox(make: string, model: string, year: number | undefined, country = defaultCountry): Promise<Fuse[]> {
    try {
      const listingHtml = await this.fetcher.get(`/${country}/${make}/${model}/info/fusebox`, cacheTtlMs.data);
      const references = parseFuseboxReferences(listingHtml);
      const selectedReference = this.selectFuseboxReference(references, year);
      const detailHtml = await this.fetcher.get(selectedReference.path, cacheTtlMs.data);
      return parseFusebox(detailHtml);
    } catch (error) {
      throw this.toServiceError(error, `Failed to load fuse box data for ${make} ${model}.`);
    }
  }

  async getManuals(make: string, model: string, year: number | undefined, country = defaultCountry): Promise<Manual[]> {
    try {
      const ownersListHtml = await this.fetcher.get(`/${country}/${make}/${model}/info/manuals`, cacheTtlMs.data);
      const serviceHtml = await this.fetcher.get(`/${country}/${make}/${model}/info/manuals/service-repair`, cacheTtlMs.data);
      const serviceManuals = parseServiceRepairManuals(serviceHtml);

      if (year) {
        const ownerHtml = await this.fetcher.get(`/${country}/${make}/${model}/info/manuals/${year}`, cacheTtlMs.data);
        const ownerManuals = parseOwnerManualDetail(ownerHtml);
        return sortByYearDesc([...ownerManuals, ...serviceManuals.filter((item) => item.year === year)]);
      }

      const ownerReferences = parseManualList(ownersListHtml);
      return sortByYearDesc([...ownerReferences, ...serviceManuals]);
    } catch (error) {
      throw this.toServiceError(error, `Failed to load manuals for ${make} ${model}.`);
    }
  }

  async getGuides(make: string, model: string, guide: string | undefined, country = defaultCountry): Promise<Guide[] | Guide> {
    try {
      const listHtml = await this.fetcher.get(`/${country}/${make}/${model}/guides`, cacheTtlMs.guides);

      if (!guide) {
        return parseGuideList(listHtml);
      }

      const detailHtml = await this.fetcher.get(`/${country}/${make}/${model}/guides/${guide}`, cacheTtlMs.guides);
      return parseGuideDetail(detailHtml, guide);
    } catch (error) {
      throw this.toServiceError(error, `Failed to load guides for ${make} ${model}.`);
    }
  }

  async compareModels(make1: string, model1: string, make2: string, model2: string, country = defaultCountry): Promise<ComparisonResult> {
    try {
      const path = `/${country}/${make1}/${model1}/compare/${make2}/${model2}`;
      const html = await this.fetcher.get(path, cacheTtlMs.data);
      return parseComparison(html);
    } catch (error) {
      throw this.toServiceError(error, `Failed to compare ${make1} ${model1} and ${make2} ${model2}.`);
    }
  }

  private selectFuseboxReference(references: { year: number; path: string }[], year: number | undefined): { year: number; path: string } {
    if (references.length === 0) {
      throw new NotFoundError("No fuse box diagrams were found for this model.");
    }

    if (year === undefined) {
      const latestReference = references[0];

      if (latestReference) {
        return latestReference;
      }
    }

    const match = references.find((reference) => reference.year === year);

    if (match) {
      return match;
    }

    throw new NotFoundError(`No fuse box diagram was found for year ${year}.`);
  }

  private toServiceError(error: unknown, fallbackMessage: string): CranklyError {
    if (error instanceof CranklyError) {
      return error;
    }

    if (error instanceof Error) {
      return new CranklyError(error.message || fallbackMessage, "SERVICE_ERROR", 502);
    }

    return new CranklyError(fallbackMessage, "SERVICE_ERROR", 502);
  }
}

export const createStartMyCarService = (): StartMyCarService => new StartMyCarService(new HtmlFetcher());
