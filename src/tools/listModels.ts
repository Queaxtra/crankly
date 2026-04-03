import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolErrorResult, createToolResult } from "../lib/result.ts";
import { toToolErrorMessage } from "../lib/errors.ts";
import { listModelsInputSchema } from "../lib/validation.ts";
import type { StartMyCarService } from "../services/startmycar.ts";

export const registerListModelsTool = (server: McpServer, service: StartMyCarService): void => {
  server.registerTool(
    "listModels",
    {
      description: "List models for a vehicle make. country defaults to us.",
      inputSchema: listModelsInputSchema,
    },
    async ({ country, make }) => {
      try {
        const data = await service.listModels(make, country);
        return createToolResult(data);
      } catch (error) {
        return createToolErrorResult(toToolErrorMessage(error));
      }
    },
  );
};
