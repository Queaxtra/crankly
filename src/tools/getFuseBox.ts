import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolErrorResult, createToolResult } from "../lib/result.ts";
import { toToolErrorMessage } from "../lib/errors.ts";
import { getFuseBoxInputSchema } from "../lib/validation.ts";
import type { StartMyCarService } from "../services/startmycar.ts";

export const registerGetFuseBoxTool = (server: McpServer, service: StartMyCarService): void => {
  server.registerTool(
    "getFuseBox",
    {
      description: "Load fuse box data for a make and model. When year is omitted, the latest available diagram is used.",
      inputSchema: getFuseBoxInputSchema,
    },
    async ({ country, make, model, year }) => {
      try {
        const data = await service.getFuseBox(make, model, year, country);
        return createToolResult(data);
      } catch (error) {
        return createToolErrorResult(toToolErrorMessage(error));
      }
    },
  );
};
