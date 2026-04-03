import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.ts";

const start = async (): Promise<void> => {
  const server = createServer();
  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start crankly.";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
};

void start();
