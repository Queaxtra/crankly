import { load, type CheerioAPI } from "cheerio";

const collapseWhitespace = /\s+/g;

export const loadHtml = (html: string): CheerioAPI => load(html);

export const normalizeText = (value: string | undefined | null): string => {
  if (!value) {
    return "";
  }

  return value.replace(collapseWhitespace, " ").replace(/\u00a0/g, " ").trim();
};

export const getAbsoluteUrl = (baseUrl: string, path: string): string => new URL(path, baseUrl).toString();

export const getLastPathPart = (path: string): string => {
  const parts = path.split("/").filter(Boolean);
  return parts.at(-1) ?? "";
};

export const htmlToPlainText = ($: CheerioAPI, root: string): string => {
  const lines: string[] = [];
  const wrapper = $("<div>").html(root);
  const blocks = wrapper.find("h1, h2, h3, p, li").addBack("h1, h2, h3, p, li");

  blocks.each((_, element) => {
    const text = normalizeText($(element).text());

    if (!text) {
      return;
    }

    lines.push(text);
  });

  return lines.join("\n\n");
};

export const slugToName = (slug: string): string => {
  const uppercaseWords = new Set(["bmw", "gmc", "mg", "ram", "jac", "ds", "byd", "dfsk", "hsv", "swm"]);

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => {
      const normalized = part.toLowerCase();

      if (uppercaseWords.has(normalized)) {
        return normalized.toUpperCase();
      }

      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join(" ");
};
