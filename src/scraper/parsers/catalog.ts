import type { CheerioAPI } from "cheerio";
import { baseUrl, allowedManualHosts } from "../../config/constants.ts";
import type { FuseboxReference, Guide, Make, Manual, Model } from "../../types/index.ts";
import { getAbsoluteUrl, getLastPathPart, htmlToPlainText, loadHtml, normalizeText, slugToName } from "../html.ts";

const uniqueBySlug = <T extends { slug: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const item of items) {
    if (seen.has(item.slug)) {
      continue;
    }

    seen.add(item.slug);
    unique.push(item);
  }

  return unique;
};

const toSafeManualUrl = (url: string): string => {
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Rejected non-https manual url.");
  }

  if (!allowedManualHosts.has(parsedUrl.hostname)) {
    throw new Error("Rejected unexpected manual host.");
  }

  return parsedUrl.toString();
};

export const parseMakes = (html: string): Make[] => {
  const $ = loadHtml(html);
  const visibleNames = new Map<string, string>();

  $("#restoMarcas a.ModelRow").each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const slug = href.split("/").filter(Boolean).at(1) ?? "";
    const name = normalizeText($(element).find(".ModelRow__text").text()) || slugToName(slug);

    if (!slug) {
      return;
    }

    visibleNames.set(slug, name);
  });

  const match = html.match(/allMakesImageMapping\s*=\s*(\[[^;]+\])/s);

  if (!match) {
    return [...visibleNames.entries()].map(([slug, name]) => ({ slug, name }));
  }

  const serialized = match[1];

  if (!serialized) {
    return [...visibleNames.entries()].map(([slug, name]) => ({ slug, name }));
  }

  const slugs = JSON.parse(serialized) as string[];

  return uniqueBySlug(
    slugs
      .filter(Boolean)
      .map((slug) => ({
        slug,
        name: visibleNames.get(slug) ?? slugToName(slug),
      })),
  );
};

export const parseModels = (html: string, country: string, make: string): Model[] => {
  const $ = loadHtml(html);
  const models: Model[] = [];
  const expectedPrefix = `/${country}/${make}/`;

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href") ?? "";

    if (!href.startsWith(expectedPrefix)) {
      return;
    }

    const slug = href.slice(expectedPrefix.length).split("/")[0] ?? "";

    if (!slug || slug === "pickmodel") {
      return;
    }

    const name = normalizeText($(element).text());

    if (!name) {
      return;
    }

    models.push({ slug, name });
  });

  return uniqueBySlug(models);
};

export const parseGuideList = (html: string): Guide[] => {
  const $ = loadHtml(html);
  const guides: Guide[] = [];

  $("a.ArticleLink[href*='/guides/']").each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const slug = getLastPathPart(href);
    const title = normalizeText($(element).find(".ArticleLink__text").text());

    if (!slug || !title) {
      return;
    }

    guides.push({ slug, title });
  });

  return uniqueBySlug(guides);
};

export const parseGuideDetail = (html: string, fallbackSlug: string): Guide => {
  const $ = loadHtml(html);
  const article = $(".Article").first();
  const title = normalizeText(article.find("h2").first().text()) || slugToName(fallbackSlug);
  const contentRoot = article.children("div").first();
  const content = htmlToPlainText($, contentRoot.html() ?? "");

  return {
    slug: fallbackSlug,
    title,
    content,
  };
};

export const parseManualList = (html: string): Manual[] => {
  const $ = loadHtml(html);
  const manuals: Manual[] = [];

  $("a.manual[href*='/info/manuals/']").each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const yearText = normalizeText($(element).find(".big-year").text());
    const year = Number(yearText);

    if (!Number.isInteger(year)) {
      return;
    }

    manuals.push({
      year,
      type: "owner-manuals",
      url: getAbsoluteUrl(baseUrl, href),
    });
  });

  return manuals.sort((left, right) => right.year - left.year);
};

export const parseOwnerManualDetail = (html: string): Manual[] => {
  const $ = loadHtml(html);
  const manuals: Manual[] = [];
  const heading = normalizeText($(".owners-manual h1").first().text());
  const headingYear = Number(heading.match(/(19|20)\d{2}/)?.[0] ?? "0");

  $(".manuals-box").each((_, element) => {
    const link = $(element).find("a.js-manual").first();
    const href = link.attr("href") ?? "";

    if (!href) {
      return;
    }

    const trim = $(element)
      .children(".color-text-gray")
      .map((__, item) => normalizeText($(item).text()))
      .get()
      .find((value) => value.toLowerCase().startsWith("for "));
    const type = trim ? `owner-manual - ${trim}` : "owner-manual";

    manuals.push({
      year: headingYear,
      type: type.toLowerCase(),
      url: toSafeManualUrl(href),
    });
  });

  return manuals;
};

export const parseServiceRepairManuals = (html: string): Manual[] => {
  const $ = loadHtml(html);
  const manuals: Manual[] = [];

  $(".manuals-box").each((_, element) => {
    const title = normalizeText($(element).find(".manuals-box__titlebar").text());
    const href = $(element).find("a.js-manual").attr("href") ?? "";

    if (!href) {
      return;
    }

    const year = Number(title.match(/(19|20)\d{2}/)?.[0] ?? "0");
    const type = normalizeText($(element).find(".Subtitle").first().text()) || "service manual";

    if (!Number.isInteger(year) || year < 1900) {
      return;
    }

    manuals.push({
      year,
      type: type.toLowerCase(),
      url: toSafeManualUrl(href),
    });
  });

  return manuals.sort((left, right) => right.year - left.year);
};

export const parseFuseboxReferences = (html: string): FuseboxReference[] => {
  const $ = loadHtml(html);
  const references: FuseboxReference[] = [];

  $("a.FuseboxCard[href*='/info/fusebox/']").each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const year = Number(href.match(/\/info\/fusebox\/(\d{4})/)?.[1] ?? "0");

    if (!href || !Number.isInteger(year)) {
      return;
    }

    references.push({ year, path: href });
  });

  return references;
};

export const parseComparisonModels = ($: CheerioAPI): { make: string; model: string; url: string }[] => {
  const models: { make: string; model: string; url: string }[] = [];

  $(".margin-medium h1 a").each((_, element) => {
    const url = getAbsoluteUrl(baseUrl, $(element).attr("href") ?? "/");
    const make = normalizeText($(element).find(".marca").text());
    const model = normalizeText($(element).find(".modelo").text());

    if (!make || !model) {
      return;
    }

    models.push({ make, model, url });
  });

  return models;
};
