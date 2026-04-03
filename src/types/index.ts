export const supportedCountries = ["us", "au", "ca", "gb", "nz", "za", "it", "fr", "de"] as const;

export type CountryCode = (typeof supportedCountries)[number];

export interface Make {
  slug: string;
  name: string;
}

export interface Model {
  slug: string;
  name: string;
}

export interface Problem {
  title: string;
  description: string;
  votes: number;
  solutions: string[];
  author: string;
  date: string;
}

export interface Review {
  rating: number;
  text: string;
  author: string;
  date: string;
  pros: string[];
  cons: string[];
}

export interface Fuse {
  position: string;
  amperage: string;
  circuit: string;
  description: string;
}

export interface Manual {
  year: number;
  type: string;
  url: string;
}

export interface Guide {
  slug: string;
  title: string;
  content?: string;
}

export interface ComparisonEntry {
  label: string;
  score: number;
  url: string;
}

export interface ComparisonSection {
  title: string;
  model1: ComparisonEntry[];
  model2: ComparisonEntry[];
}

export interface ModelSummary {
  make: string;
  model: string;
  url: string;
}

export interface ComparisonResult {
  model1: ModelSummary;
  model2: ModelSummary;
  comparison: {
    sections: ComparisonSection[];
  };
}

export interface ProblemSummary {
  title: string;
  description: string;
  author: string;
  date: string;
  detailPath: string;
}

export interface ProblemDetail extends Omit<Problem, "votes"> {
  votes: number;
}

export interface FuseboxReference {
  year: number;
  path: string;
}
