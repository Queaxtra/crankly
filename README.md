# Crankly

Crankly is a Model Context Protocol (MCP) server for structured public vehicle data from StartMyCar.

## What Crankly provides

Crankly exposes the following read-only tools:

| Tool | Description |
|------|-------------|
| `listMakes` | Lists available vehicle makes |
| `listModels` | Lists models for a given make |
| `getProblems` | Returns reported owner problems |
| `getReviews` | Returns owner reviews |
| `getFuseBox` | Returns fuse box entries and circuit references |
| `getManuals` | Returns owner and service manual links |
| `getGuides` | Returns guide listings or guide content |
| `compareModels` | Returns comparison data for two models |

Supported country prefixes:

- `us`
- `au`
- `ca`
- `gb`
- `nz`
- `za`
- `it`
- `fr`
- `de`

Default country: `us`

---

## Runtime and package manager support

Crankly runs on **Bun**.

However, the package itself can be installed or executed using different JavaScript package managers and runners:

- Bun
- npm
- pnpm
- Yarn

### Important note

Even if you install Crankly through `npm`, `pnpm`, or `yarn`, the executable still expects **Bun to be available on the machine** because the server runtime is Bun-based.

In practice this means:

- package manager choice is flexible
- runtime requirement is still Bun

Check Bun:

```bash
bun --version
```

---

## Installation options

## 1. Run from local source

Use this when developing or testing the repository directly.

```bash
git clone https://github.com/Queaxtra/crankly.git
cd crankly
bun install
```

Then point your MCP client to:

```bash
bun /absolute/path/to/crankly/index.ts
```

## 2. Run without global installation

This is the easiest published-package flow for one-off or ephemeral use.

### Bun

```bash
bunx crankly
```

### npm

```bash
npx crankly
```

### pnpm

```bash
pnpm dlx crankly
```

### Yarn

```bash
yarn dlx crankly
```

> These commands still require Bun to be installed because the Crankly executable uses Bun at runtime.

## 3. Global installation

This is the cleanest option for repeated use across multiple MCP clients.

### Bun

```bash
bun add -g crankly
```

### npm

```bash
npm install -g crankly
```

### pnpm

```bash
pnpm add -g crankly
```

### Yarn Classic

```bash
yarn global add crankly
```

After global installation, the executable becomes:

```bash
crankly
```

Verify:

```bash
command -v crankly
```

---

## Quick local validation

### Type-check

```bash
bun run typecheck
```

### Start from source

```bash
bun run index.ts
```

### Inspect with MCP Inspector

If you want to test tools one by one before connecting a client:

```bash
bunx @modelcontextprotocol/inspector bun /absolute/path/to/crankly/index.ts
```

If you already have the executable available globally:

```bash
bunx @modelcontextprotocol/inspector crankly
```

Useful smoke-test inputs:

### `listMakes`

```json
{}
```

### `listModels`

```json
{
  "make": "toyota"
}
```

### `getProblems`

```json
{
  "make": "toyota",
  "model": "corolla",
  "page": 1
}
```

### `getReviews`

```json
{
  "make": "toyota",
  "model": "corolla"
}
```

### `getFuseBox`

```json
{
  "make": "toyota",
  "model": "corolla",
  "year": 2024
}
```

### `getManuals`

```json
{
  "make": "toyota",
  "model": "corolla",
  "year": 2022
}
```

### `getGuides`

```json
{
  "make": "toyota",
  "model": "corolla"
}
```

### `getGuides` detail

```json
{
  "make": "toyota",
  "model": "corolla",
  "guide": "tire-pressure"
}
```

### `compareModels`

```json
{
  "make1": "toyota",
  "model1": "corolla",
  "make2": "honda",
  "model2": "civic"
}
```

---

# MCP client setup

## Codex

Codex supports stdio MCP servers and can register them directly from the CLI.

## Fastest setup commands

### Using Bun runner

```bash
codex mcp add crankly -- bunx crankly
```

### Using npm runner

```bash
codex mcp add crankly -- npx crankly
```

### Using pnpm runner

```bash
codex mcp add crankly -- pnpm dlx crankly
```

### Using Yarn runner

```bash
codex mcp add crankly -- yarn dlx crankly
```

### Using global installation

If you already installed Crankly globally:

```bash
codex mcp add crankly -- crankly
```

### Using local source directly

```bash
codex mcp add crankly -- bun /absolute/path/to/crankly/index.ts
```

## Manual Codex config

Codex commonly uses a TOML config similar to:

### Local source

```toml
[mcp_servers.crankly]
command = "bun"
args = ["/absolute/path/to/crankly/index.ts"]
startup_timeout_sec = 20
tool_timeout_sec = 120
```

### Bun ephemeral runner

```toml
[mcp_servers.crankly]
command = "bunx"
args = ["crankly"]
startup_timeout_sec = 20
tool_timeout_sec = 120
```

### npm ephemeral runner

```toml
[mcp_servers.crankly]
command = "npx"
args = ["crankly"]
startup_timeout_sec = 20
tool_timeout_sec = 120
```

### pnpm ephemeral runner

```toml
[mcp_servers.crankly]
command = "pnpm"
args = ["dlx", "crankly"]
startup_timeout_sec = 20
tool_timeout_sec = 120
```

### global executable

```toml
[mcp_servers.crankly]
command = "crankly"
startup_timeout_sec = 20
tool_timeout_sec = 120
```

## Verify in Codex

```bash
codex mcp list
```

Then try prompts such as:

- `Use crankly to list the first 10 makes.`
- `Use crankly to list Toyota models.`
- `Use crankly to get Toyota Corolla reviews.`
- `Use crankly to compare Toyota Corolla and Honda Civic.`

---

## Claude Code

Claude Code supports stdio MCP servers and can register them from the CLI.

## Fastest setup commands

### Using Bun runner

```bash
claude mcp add --transport stdio crankly -- bunx crankly
```

### Using npm runner

```bash
claude mcp add --transport stdio crankly -- npx crankly
```

### Using pnpm runner

```bash
claude mcp add --transport stdio crankly -- pnpm dlx crankly
```

### Using Yarn runner

```bash
claude mcp add --transport stdio crankly -- yarn dlx crankly
```

### Using global installation

```bash
claude mcp add --transport stdio crankly -- crankly
```

### Using local source directly

```bash
claude mcp add --transport stdio crankly -- bun /absolute/path/to/crankly/index.ts
```

## Manual Claude Code config

Project-level `.mcp.json` example:

### Local source

```json
{
  "mcpServers": {
    "crankly": {
      "type": "stdio",
      "command": "bun",
      "args": ["/absolute/path/to/crankly/index.ts"]
    }
  }
}
```

### Bun runner

```json
{
  "mcpServers": {
    "crankly": {
      "type": "stdio",
      "command": "bunx",
      "args": ["crankly"]
    }
  }
}
```

### npm runner

```json
{
  "mcpServers": {
    "crankly": {
      "type": "stdio",
      "command": "npx",
      "args": ["crankly"]
    }
  }
}
```

### pnpm runner

```json
{
  "mcpServers": {
    "crankly": {
      "type": "stdio",
      "command": "pnpm",
      "args": ["dlx", "crankly"]
    }
  }
}
```

### global executable

```json
{
  "mcpServers": {
    "crankly": {
      "type": "stdio",
      "command": "crankly"
    }
  }
}
```

## Verify in Claude Code

Inside Claude Code:

```text
/mcp
```

Check that `crankly` is connected and tools are visible.

Suggested prompts:

- `Use crankly to list makes.`
- `Use crankly to get Toyota Corolla problems page 1.`
- `Use crankly to get Toyota Corolla manuals for 2022.`
- `Use crankly to get the latest Corolla fuse box data.`

---

## OpenCode

OpenCode supports MCP servers through its JSON configuration.

### Recommended config locations

- `~/.config/opencode/opencode.json`
- project-local `opencode.json`

## Config examples

### Using Bun runner

```json
{
  "mcp": {
    "crankly": {
      "type": "local",
      "enabled": true,
      "command": ["bunx", "crankly"]
    }
  }
}
```

### Using npm runner

```json
{
  "mcp": {
    "crankly": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "crankly"]
    }
  }
}
```

### Using pnpm runner

```json
{
  "mcp": {
    "crankly": {
      "type": "local",
      "enabled": true,
      "command": ["pnpm", "dlx", "crankly"]
    }
  }
}
```

### Using Yarn runner

```json
{
  "mcp": {
    "crankly": {
      "type": "local",
      "enabled": true,
      "command": ["yarn", "dlx", "crankly"]
    }
  }
}
```

### Using global installation

```json
{
  "mcp": {
    "crankly": {
      "type": "local",
      "enabled": true,
      "command": ["crankly"]
    }
  }
}
```

### Using local source

```json
{
  "mcp": {
    "crankly": {
      "type": "local",
      "enabled": true,
      "command": [
        "bun",
        "/absolute/path/to/crankly/index.ts"
      ]
    }
  }
}
```

## Verify in OpenCode

Restart OpenCode after updating config.

Suggested prompts:

- `use crankly and list makes`
- `use crankly and list toyota models`
- `use crankly and get toyota corolla reviews`
- `use crankly and compare corolla with civic`

---

## Which setup should you choose?

### Best for local development

Use direct source execution:

```bash
bun /absolute/path/to/crankly/index.ts
```

### Best for published package without permanent global install

Use one of:

```bash
bunx crankly
npx crankly
pnpm dlx crankly
yarn dlx crankly
```

### Best for repeat daily use

Install globally and use:

```bash
crankly
```

---

## Troubleshooting

### The command appears to hang

This is expected if you run the server directly.

Example:

```bash
crankly
```

The server is waiting for MCP input. Use an MCP client or MCP Inspector.

### The client says the server did not start

Use an absolute path first:

```bash
bun /absolute/path/to/crankly/index.ts
```

This avoids PATH resolution issues.

### `crankly` command is not found

Install globally with your preferred package manager:

```bash
bun add -g crankly
```

or:

```bash
npm install -g crankly
```

or:

```bash
pnpm add -g crankly
```

Then verify:

```bash
command -v crankly
```

### `npx crankly` or `pnpm dlx crankly` resolves but fails at runtime

Make sure Bun is installed and available in your PATH.

### A client does not pick up changes

Restart the MCP client after updating configuration.

---

## License

This project is licensed under the MIT License.
See [LICENSE](./LICENSE).
