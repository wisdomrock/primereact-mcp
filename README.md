# primereact-mcp

A Model Context Protocol (MCP) server that gives AI assistants full access to **PrimeReact v10** component documentation — props, events, examples, and search.

> **Why does this exist?**  
> The PrimeReact team has not yet published an official `@primereact/mcp` package. This server fills that gap using the same engine (`@primeuix/mcp`) that powers the official PrimeNG MCP server, with component data extracted from PrimeReact's TypeScript definitions.
> The official PrimeReact MCP will be launched with v11.

---

## Features

- 105 PrimeReact v10 components with full prop/event documentation
- 15+ MCP tools: search, suggest, inspect props, get examples, compare components, and more
- Works with Claude Code, Claude Desktop, Cursor, Windsurf, and any MCP-compatible client
- Generated directly from PrimeReact's TypeScript `.d.ts` source — no stale hand-written docs

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- An MCP-compatible AI client (see below)

### Option A — npx (no install needed)

Use `npx -y primereact-mcp` directly in your MCP client config. Component data ships pre-generated inside the package.

### Option B — clone and run locally

```bash
git clone https://github.com/wisdomrock/primereact-mcp.git
cd primereact-mcp
npm install
node index.mjs   # starts the server
```

To regenerate component data after a PrimeReact version upgrade:

```bash
npm install primereact@10   # install the target version
node generate-data.mjs      # rewrites components-data.json
```

---

## MCP Client Setup

### Claude Code (CLI)

```bash
# via npx — zero install
claude mcp add primereact -- npx -y primereact-mcp

# or point at a local clone
claude mcp add primereact -- node /absolute/path/to/primereact-mcp/index.mjs
```

Or add it to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "primereact": {
      "command": "npx",
      "args": ["-y", "primereact-mcp"]
    }
  }
}
```

### Claude Desktop

Add the following to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "primereact": {
      "command": "npx",
      "args": ["-y", "primereact-mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "primereact": {
      "command": "npx",
      "args": ["-y", "primereact-mcp"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "primereact": {
      "command": "npx",
      "args": ["-y", "primereact-mcp"]
    }
  }
}
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `list_components` | List all 105 PrimeReact components, optionally filtered by category |
| `get_component` | Get full details for a component (stats, props preview, sections) |
| `get_component_props` | Get all props for a component with types and descriptions |
| `get_component_events` | Get all event callbacks a component supports |
| `get_component_methods` | Get component methods (where documented) |
| `get_component_slots` | Get slots/render props for a component |
| `get_component_pt` | Get Pass Through (PT) customization options |
| `get_component_tokens` | Get design tokens (CSS variables) |
| `get_component_styles` | Get CSS class names |
| `get_component_sections` | Get all sections with examples (basic, advanced, etc.) |
| `get_component_import` | Get the correct import statement |
| `get_component_url` | Get the official documentation URL |
| `get_usage_example` | Get code examples for a component |
| `search_components` | Search components by name or description |
| `find_by_prop` | Find all components that have a specific prop |
| `find_by_event` | Find all components that emit a specific event |
| `find_components_with_feature` | Find components with a feature (e.g. "filter", "lazy", "virtual") |
| `compare_components` | Compare two components side by side |
| `suggest_component` | Suggest components based on a use-case description |
| `get_categories` | Get all component categories |
| `get_version_info` | Get PrimeReact version and compatibility info |
| `get_form_components` | Get all form input components |
| `get_data_components` | Get all data display components (tables, lists, trees) |
| `get_overlay_components` | Get all overlay/popup components |

### Example prompts

```
Which PrimeReact component should I use for a searchable multi-select?

What props does the DataTable component accept?

Find all PrimeReact components that have a filter prop.

Compare the Dropdown and AutoComplete components.

Show me the import statement for the Calendar component.
```

---

## Upgrading PrimeReact Version

To update the component data after upgrading PrimeReact:

```bash
npm install primereact@NEW_VERSION
node generate-data.mjs
```

The `generate-data.mjs` script re-reads all `.d.ts` files and rewrites `components-data.json`.

---

## Project Structure

```
primereact-mcp/
├── index.mjs              # MCP server entry point
├── generate-data.mjs      # Generates components-data.json from .d.ts files
├── components-data.json   # Generated component data (committed for convenience)
├── package.json
└── README.md
```

### How it works

1. **`generate-data.mjs`** reads each component's `.d.ts` file from the `primereact` npm package, parses JSDoc comments and TypeScript interface definitions using a line-by-line state machine, and writes structured JSON to `components-data.json`.

2. **`index.mjs`** calls `runPrimeMcpServer()` from `@primeuix/mcp` — the same shared engine used by the official PrimeNG MCP server — passing PrimeReact-specific configuration and the generated component data.

---

## Contributing

Contributions welcome! Areas that would benefit from improvement:

- **Richer examples** — add JSX code snippets to more component sections
- **PrimeReact v11 support** — the alpha v11 uses `@primereact/types`, requiring a different parsing strategy
- **Pass Through (PT) data** — extract PT options from `.d.ts` files
- **Design tokens** — extract CSS variable names

Please open an issue before sending a large PR.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Related

- [@primeng/mcp](https://www.npmjs.com/package/@primeng/mcp) — Official MCP server for PrimeNG (Angular)
- [@primeuix/mcp](https://www.npmjs.com/package/@primeuix/mcp) — Shared MCP engine by the PrimeFaces team
- [PrimeReact Documentation](https://primereact.org)
- [Model Context Protocol](https://modelcontextprotocol.io)