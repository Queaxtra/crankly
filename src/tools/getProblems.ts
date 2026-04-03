import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolErrorResult, createToolResult } from "../lib/result.ts";
import { toToolErrorMessage } from "../lib/errors.ts";
import { getProblemsInputSchema } from "../lib/validation.ts";
import type { StartMyCarService } from "../services/startmycar.ts";

export const registerGetProblemsTool = (server: McpServer, service: StartMyCarService): void => {
  server.registerTool(
    "getProblems",
    {
      description: "Load reported problems for a make and model. page defaults to 1 and country defaults to us.",
      inputSchema: getProblemsInputSchema,
    },
    async ({ country, make, model, page }) => {
      try {
        const data = await service.getProblems(make, model, page, country);
        return createToolResult(data);
      } catch (error) {
        return createToolErrorResult(toToolErrorMessage(error));
      }
    },
  );
};
