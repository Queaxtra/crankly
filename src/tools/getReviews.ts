import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolErrorResult, createToolResult } from "../lib/result.ts";
import { toToolErrorMessage } from "../lib/errors.ts";
import { getReviewsInputSchema } from "../lib/validation.ts";
import type { StartMyCarService } from "../services/startmycar.ts";

export const registerGetReviewsTool = (server: McpServer, service: StartMyCarService): void => {
  server.registerTool(
    "getReviews",
    {
      description: "Load owner reviews for a make and model. country defaults to us.",
      inputSchema: getReviewsInputSchema,
    },
    async ({ country, make, model }) => {
      try {
        const data = await service.getReviews(make, model, country);
        return createToolResult(data);
      } catch (error) {
        return createToolErrorResult(toToolErrorMessage(error));
      }
    },
  );
};
