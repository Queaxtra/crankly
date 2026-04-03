import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createStartMyCarService } from "./services/startmycar.ts";
import { registerCompareModelsTool } from "./tools/compareModels.ts";
import { registerGetFuseBoxTool } from "./tools/getFuseBox.ts";
import { registerGetGuidesTool } from "./tools/getGuides.ts";
import { registerGetManualsTool } from "./tools/getManuals.ts";
import { registerGetProblemsTool } from "./tools/getProblems.ts";
import { registerGetReviewsTool } from "./tools/getReviews.ts";
import { registerListMakesTool } from "./tools/listMakes.ts";
import { registerListModelsTool } from "./tools/listModels.ts";

export const createServer = (): McpServer => {
  const server = new McpServer(
    {
      name: "crankly",
      version: "0.1.0",
    },
    {
      instructions:
        "Crankly exposes public StartMyCar vehicle data over MCP. All tools are read-only, default to the us catalog, and accept an optional country parameter when regional pages exist.",
    },
  );
  const service = createStartMyCarService();

  registerListMakesTool(server, service);
  registerListModelsTool(server, service);
  registerGetProblemsTool(server, service);
  registerGetReviewsTool(server, service);
  registerGetFuseBoxTool(server, service);
  registerGetManualsTool(server, service);
  registerGetGuidesTool(server, service);
  registerCompareModelsTool(server, service);

  return server;
};
