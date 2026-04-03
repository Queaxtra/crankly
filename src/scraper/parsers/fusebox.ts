import type { Fuse } from "../../types/index.ts";
import { loadHtml, normalizeText } from "../html.ts";

const parseFuseDescription = (value: string): { circuit: string; description: string } => {
  const match = value.match(/^\(([^)]+)\)\s*(.*)$/);

  if (!match) {
    return {
      circuit: "",
      description: value,
    };
  }

  return {
    circuit: normalizeText(match[1]),
    description: normalizeText(match[2]),
  };
};

export const parseFusebox = (html: string): Fuse[] => {
  const $ = loadHtml(html);
  const fuses: Fuse[] = [];

  $("tr.row-fuse").each((_, element) => {
    const row = $(element);
    const position = normalizeText(row.find(".fuseid").first().text());
    const amperage = normalizeText(row.find(".amp").first().text()) || normalizeText(row.find(".fusetype").first().text());
    const detail = parseFuseDescription(normalizeText(row.find(".fusedesc").first().text()));

    if (!position || !detail.description) {
      return;
    }

    fuses.push({
      position,
      amperage,
      circuit: detail.circuit,
      description: detail.description,
    });
  });

  return fuses;
};
