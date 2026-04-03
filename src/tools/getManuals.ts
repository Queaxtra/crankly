import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolErrorResult, createToolResult } from "../lib/result.ts";
import { toToolErrorMessage } from "../lib/errors.ts";
import { getManualsInputSchema } from "../lib/validation.ts";
import type { StartMyCarService } from "../services/startmycar.ts";

export const registerGetManualsTool = (server: McpServer, service: StartMyCarService): void => {
  server.registerTool(
    "getManuals",
    {
      description: "Load owner and service manuals. When year is omitted, owner manual detail-page links are returned for each year.",
      inputSchema: getManualsInputSchema,
    },
    async ({ country, make, model, year }) => {
      try {
        const data = await service.getManuals(make, model, year, country);
        return createToolResult(data);
      } catch (error) {
        return createToolErrorResult(toToolErrorMessage(error));
      }
    },
  );
};
