import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolErrorResult, createToolResult } from "../lib/result.ts";
import { toToolErrorMessage } from "../lib/errors.ts";
import { listMakesInputSchema } from "../lib/validation.ts";
import type { StartMyCarService } from "../services/startmycar.ts";

export const registerListMakesTool = (server: McpServer, service: StartMyCarService): void => {
  server.registerTool(
    "listMakes",
    {
      description: "List available vehicle makes from StartMyCar. country defaults to us.",
      inputSchema: listMakesInputSchema,
    },
    async ({ country }) => {
      try {
        const data = await service.listMakes(country);
        return createToolResult(data);
      } catch (error) {
        return createToolErrorResult(toToolErrorMessage(error));
      }
    },
  );
};
