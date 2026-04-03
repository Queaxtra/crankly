import { z } from "zod";
import { defaultCountry } from "../config/constants.ts";
import { supportedCountries } from "../types/index.ts";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Invalid slug.")
  .transform((value) => value.toLowerCase());

const countrySchema = z
  .enum(supportedCountries)
  .default(defaultCountry);

const pageSchema = z.coerce.number().int().min(1).max(100).default(1);
const yearSchema = z.coerce.number().int().min(1950).max(2035);

export const listMakesInputSchema = z.object({
  country: countrySchema.optional(),
});

export const listModelsInputSchema = z.object({
  country: countrySchema.optional(),
  make: slugSchema,
});

export const getProblemsInputSchema = z.object({
  country: countrySchema.optional(),
  make: slugSchema,
  model: slugSchema,
  page: pageSchema.optional(),
});

export const getReviewsInputSchema = z.object({
  country: countrySchema.optional(),
  make: slugSchema,
  model: slugSchema,
});

export const getFuseBoxInputSchema = z.object({
  country: countrySchema.optional(),
  make: slugSchema,
  model: slugSchema,
  year: yearSchema.optional(),
});

export const getManualsInputSchema = z.object({
  country: countrySchema.optional(),
  make: slugSchema,
  model: slugSchema,
  year: yearSchema.optional(),
});

export const getGuidesInputSchema = z.object({
  country: countrySchema.optional(),
  make: slugSchema,
  model: slugSchema,
  guide: slugSchema.optional(),
});

export const compareModelsInputSchema = z.object({
  country: countrySchema.optional(),
  make1: slugSchema,
  model1: slugSchema,
  make2: slugSchema,
  model2: slugSchema,
});
