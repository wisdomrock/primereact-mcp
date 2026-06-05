# Changelog

All notable changes to this project will be documented in this file.

## [1.2.2] - 2026-06-05

### Added
- Vitest-based unit and integration test suite (`test/unit/`, `test/integration/`, `test/fixtures/`)
- `npm test`, `npm run test:watch`, and `npm run test:coverage` scripts
- Fixture `.d.ts` files for deterministic integration tests (no real PrimeReact install required)

### Changed
- Exported core generator functions (`capitalize`, `extractModuleDescription`, `extractInterfaceBody`, `parseProps`, `buildSections`, `buildBasicJsx`, `processComponent`) to enable unit testing
- `processComponent` now accepts `primereactDir` as an explicit parameter instead of relying on top-level scope

## [1.0.0] - 2026-06-04

### Added
- Initial release
- 105 PrimeReact v10.9.8 components parsed from TypeScript definitions
- Full prop, event, and JSDoc description extraction
- 24 MCP tools via `@primeuix/mcp` engine
- `generate-data.mjs` script for regenerating component data on version upgrades
- Support for Claude Code, Claude Desktop, Cursor, and Windsurf