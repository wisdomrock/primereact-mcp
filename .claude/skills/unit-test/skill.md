# /unit-test skill

You are assisting with Vitest unit tests for `primereact-mcp`, an unofficial MCP server for PrimeReact.
Parse the optional argument after `/unit-test` and act accordingly.

---

## Argument dispatch

| Invocation | Action |
|---|---|
| `/unit-test` | Run the full test suite and report results |
| `/unit-test --coverage` | Run with V8 coverage and show the summary |
| `/unit-test --watch` | Start Vitest in watch mode |
| `/unit-test --generate` | Find untested functions and generate new test files |
| `/unit-test --generate <name>` | Generate tests specifically for the named function |
| `/unit-test --ci` | Show the GitHub Actions workflow status / help debug it |

---

## Running tests

```bash
npm test                 # run once
npm run test:watch       # watch mode
npm run test:coverage    # with v8 coverage
```

After running, report:
- Number of test suites passed / failed
- Names and error messages of any failing tests
- If coverage was requested, the per-function coverage table from `generate-data.mjs`

---

## Test architecture

```
test/
  unit/             # Pure-function tests — no file I/O, no PrimeReact dependency
    capitalize.test.mjs
    extractModuleDescription.test.mjs
    extractInterfaceBody.test.mjs
    parseProps.test.mjs
    buildBasicJsx.test.mjs
    buildSections.test.mjs
  integration/      # I/O-bound tests using fixture .d.ts files
    processComponent.test.mjs
    dataIntegrity.test.mjs   # validates components-data.json schema
  fixtures/         # Synthetic .d.ts files — NOT real PrimeReact files
    button/button.d.ts
    dialog/dialog.d.ts
    nojsdoc/nojsdoc.d.ts
```

Source under test: `generate-data.mjs` (exports: `capitalize`, `extractModuleDescription`,
`extractInterfaceBody`, `parseProps`, `buildBasicJsx`, `buildSections`, `processComponent`).

---

## Generating new tests

When asked to generate tests (`--generate` or `--generate <name>`):

1. Read `generate-data.mjs` and list its exported functions.
2. Scan `test/unit/` and `test/integration/` for existing coverage.
3. For each gap, create or extend a `.test.mjs` file:

**Unit tests** (`test/unit/<functionName>.test.mjs`):
- Import the target function from `../../generate-data.mjs`
- Use synthetic string/object inputs — never read real PrimeReact files
- Cover: happy path, edge cases (empty input, missing fields), boundary values

**Integration tests** (`test/integration/`):
- `processComponent.test.mjs` — tests `processComponent(name, fixturesDir)` with fixture files
- `dataIntegrity.test.mjs` — validates the schema of `components-data.json`

**Fixture files** (`test/fixtures/<name>/<name>.d.ts`):
- Create minimal `.d.ts` files that mimic PrimeReact's structure
- Must include a `/** ... */` module-level JSDoc block (or intentionally omit one to test the null path)
- Must define a `<Name>Props` interface with a mix of plain props and event callbacks

Standard import pattern for all test files:
```javascript
import { describe, test, expect, beforeAll } from 'vitest';
import { functionName } from '../../generate-data.mjs';
```

---

## v10 / v11 compatibility rules

These rules keep tests green after running `npm run generate` with any PrimeReact version:

- **NEVER** assert exact component counts — use `toBeGreaterThan(0)`
- **NEVER** hardcode a version string like `'10.9.8'` — use `toMatch(/^\d+\.\d+\.\d+/)`
- **NEVER** assert a specific prop exists on a real component — use fixtures instead
- **DO** validate the shape / schema (field names, types, structure)
- **DO** assert that emits start with `"on"`, props exclude `"children"`, etc.
- Pure-function unit tests are inherently version-agnostic because they use synthetic fixtures

The GitHub Actions `v11-compat` job (`.github/workflows/test.yml`) automatically installs
`primereact@next`, regenerates the data, and re-runs all tests with `continue-on-error: true`.
Once v11 is stable, change `PRIMEREACT_VERSION: next` → `'11'` and remove `continue-on-error`.

---

## Adding a new export to `generate-data.mjs`

When a new exported function is added to `generate-data.mjs`:
1. Create `test/unit/<newFunctionName>.test.mjs`
2. Follow the patterns in the existing unit test files
3. Run `npm test` to confirm the new tests pass
4. Optionally run `npm run test:coverage` to verify coverage improved
