import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolErrorResult, createToolResult } from "../lib/result.ts";
import { toToolErrorMessage } from "../lib/errors.ts";
import { compareModelsInputSchema } from "../lib/validation.ts";
import type { StartMyCarService } from "../services/startmycar.ts";

export const registerCompareModelsTool = (server: McpServer, service: StartMyCarService): void => {
  server.registerTool(
    "compareModels",
    {
      description: "Compare two models using StartMyCar comparison pages. country defaults to us.",
      inputSchema: compareModelsInputSchema,
    },
    async ({ country, make1, model1, make2, model2 }) => {
      try {
        const data = await service.compareModels(make1, model1, make2, model2, country);
        return createToolResult(data);
      } catch (error) {
        return createToolErrorResult(toToolErrorMessage(error));
      }
    },
  );
};
