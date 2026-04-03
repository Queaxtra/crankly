import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolErrorResult, createToolResult } from "../lib/result.ts";
import { toToolErrorMessage } from "../lib/errors.ts";
import { getGuidesInputSchema } from "../lib/validation.ts";
import type { StartMyCarService } from "../services/startmycar.ts";

export const registerGetGuidesTool = (server: McpServer, service: StartMyCarService): void => {
  server.registerTool(
    "getGuides",
    {
      description: "List guide topics or load one guide in plain text. country defaults to us.",
      inputSchema: getGuidesInputSchema,
    },
    async ({ country, make, model, guide }) => {
      try {
        const data = await service.getGuides(make, model, guide, country);
        return createToolResult(data);
      } catch (error) {
        return createToolErrorResult(toToolErrorMessage(error));
      }
    },
  );
};
