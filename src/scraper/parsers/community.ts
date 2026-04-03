import type { ComparisonEntry, ComparisonResult, ComparisonSection, ProblemDetail, ProblemSummary, Review } from "../../types/index.ts";
import { baseUrl } from "../../config/constants.ts";
import { getAbsoluteUrl, loadHtml, normalizeText } from "../html.ts";
import { parseComparisonModels } from "./catalog.ts";

const parseScore = (style: string): number => {
  const match = style.match(/width:\s*(\d+)/);
  return Number(match?.[1] ?? "0");
};

export const parseProblemSummaries = (html: string): ProblemSummary[] => {
  const $ = loadHtml(html);
  const summaries: ProblemSummary[] = [];

  $(".js-report").each((_, element) => {
    const titleLink = $(element).find("h3 a").first();
    const title = normalizeText(titleLink.text());
    const detailPath = titleLink.attr("href") ?? "";
    const description = normalizeText($(element).find(".js-report-body").first().text());
    const author = normalizeText($(element).find(".AuthorShort > a").first().text());
    const date = $(element).find(".fecha").first().attr("title") ?? "";

    if (!title || !detailPath) {
      return;
    }

    summaries.push({
      title,
      description,
      author,
      date,
      detailPath,
    });
  });

  return summaries;
};

export const parseProblemDetail = (html: string): ProblemDetail => {
  const $ = loadHtml(html);
  const report = $(".js-report").first();
  const title = normalizeText(report.find(".TitleReport, .TitleListing").first().text());
  const description = normalizeText(report.find(".js-report-body").first().text());
  const author = normalizeText(report.find(".AuthorShort > a").first().text());
  const date = report.find(".fecha").first().attr("title") ?? "";
  const solutions: string[] = [];
  let votes = 0;

  $(".Report__comments .CommentCard").each((_, element) => {
    const text = normalizeText($(element).find(".CommentCard__text").text());
    const voteText = normalizeText($(element).find(".js-comment-votes").first().text());
    const voteCount = Number(voteText || "0");

    if (text) {
      solutions.push(text);
    }

    if (Number.isFinite(voteCount)) {
      votes += voteCount;
    }
  });

  return {
    title,
    description,
    author,
    date,
    votes,
    solutions: [...new Set(solutions)].slice(0, 12),
  };
};

export const parseReviews = (html: string): Review[] => {
  const $ = loadHtml(html);
  const reviews: Review[] = [];

  $(".js-review").each((_, element) => {
    const card = $(element);
    const rating = card.find("img[src*='icon_star--gold']").length;
    const pros = card
      .find(".Text")
      .map((__, item) => normalizeText($(item).text()))
      .get()
      .filter((item) => item.startsWith("The best:"));
    const cons = card
      .find(".Text")
      .map((__, item) => normalizeText($(item).text()))
      .get()
      .filter((item) => item.startsWith("The worst:"));
    const author = normalizeText(card.find(".AuthorShort > a").first().text());
    const date = card.find(".fecha").first().attr("title") ?? "";
    const standaloneText = card
      .find(".Text")
      .map((__, item) => normalizeText($(item).text()))
      .get()
      .filter((item) => !item.startsWith("The best:") && !item.startsWith("The worst:"));
    const best = pros.map((item) => item.replace(/^The best:\s*/i, "")).filter(Boolean);
    const worst = cons.map((item) => item.replace(/^The worst:\s*/i, "")).filter(Boolean);
    const text = standaloneText.join(" ") || normalizeText([best.join("; "), worst.join("; ")].filter(Boolean).join(" | "));

    reviews.push({
      rating,
      text,
      author,
      date,
      pros: best,
      cons: worst,
    });
  });

  return reviews;
};

export const parseComparison = (html: string): ComparisonResult => {
  const $ = loadHtml(html);
  const models = parseComparisonModels($);
  const columns = $(".Columns").first().children(".Columns__6");
  const leftSections = columns.eq(0).find(".tagGroup");
  const rightSections = columns.eq(1).find(".tagGroup");
  const sections: ComparisonSection[] = [];

  leftSections.each((index, element) => {
    const leftGroup = $(element);
    const rightGroup = rightSections.eq(index);
    const title = normalizeText(leftGroup.find(".Subtitle").first().text()) || `Section ${index + 1}`;
    const leftRows: ComparisonEntry[] = [];
    const rightRows: ComparisonEntry[] = [];

    leftGroup.find(".TagComparisonRow").slice(0, 20).each((_, row) => {
      const anchor = $(row).find("a").first();
      leftRows.push({
        label: normalizeText(anchor.text()),
        score: parseScore($(row).find(".TagComparisonRow__bar").attr("style") ?? ""),
        url: getAbsoluteUrl(baseUrl, anchor.attr("href") ?? "/"),
      });
    });

    rightGroup.find(".TagComparisonRow").slice(0, 20).each((_, row) => {
      const anchor = $(row).find("a").first();
      rightRows.push({
        label: normalizeText(anchor.text()),
        score: parseScore($(row).find(".TagComparisonRow__bar").attr("style") ?? ""),
        url: getAbsoluteUrl(baseUrl, anchor.attr("href") ?? "/"),
      });
    });

    sections.push({
      title,
      model1: leftRows.filter((entry) => entry.label),
      model2: rightRows.filter((entry) => entry.label),
    });
  });

  return {
    model1: models[0] ?? { make: "", model: "", url: "" },
    model2: models[1] ?? { make: "", model: "", url: "" },
    comparison: { sections },
  };
};
