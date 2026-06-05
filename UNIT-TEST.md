# Unit Testing — primereact-mcp

Vitest-based test suite for the `primereact-mcp` data generator (`generate-data.mjs`).
Tests are version-agnostic by design and remain valid after `npm run generate` is re-run
with any PrimeReact version (v10, v11, …).

---

## Quick start

```bash
npm install          # installs vitest and @vitest/coverage-v8
npm test             # run the full suite once
```

---

## Manual execution

| Command | Description |
|---|---|
| `npm test` | Run all tests once (CI mode) |
| `npm run test:watch` | Watch mode — re-runs on file save |
| `npm run test:coverage` | Run with V8 coverage; HTML report in `coverage/` |

Open `coverage/index.html` in a browser to browse line-level coverage.

---

## Test layout

```
vitest.config.mjs                      Vitest configuration (ESM, V8 coverage)

test/
├── unit/                              Pure-function tests — no I/O, no PrimeReact
│   ├── capitalize.test.mjs
│   ├── extractModuleDescription.test.mjs
│   ├── extractInterfaceBody.test.mjs
│   ├── parseProps.test.mjs
│   ├── buildBasicJsx.test.mjs
│   └── buildSections.test.mjs
├── integration/                       I/O-bound tests
│   ├── processComponent.test.mjs      uses fixture .d.ts files
│   └── dataIntegrity.test.mjs         validates components-data.json schema
└── fixtures/                          Synthetic .d.ts files (not real PrimeReact)
    ├── button/button.d.ts             simple component, no events
    ├── dialog/dialog.d.ts             component with event callbacks
    └── nojsdoc/nojsdoc.d.ts           missing module JSDoc → processComponent returns null
```

---

## What is tested

### Unit tests (`test/unit/`)

Each file targets a single exported function from `generate-data.mjs`.
All inputs are synthetic strings or objects — no file system access.

| File | Function | Key scenarios |
|---|---|---|
| `capitalize.test.mjs` | `capitalize` | lower/upper/empty/single-char |
| `extractModuleDescription.test.mjs` | `extractModuleDescription` | present, absent, @tags, multiline |
| `extractInterfaceBody.test.mjs` | `extractInterfaceBody` | found, not found, nested braces, multiple interfaces |
| `parseProps.test.mjs` | `parseProps` | optional/required, JSDoc, events, children skip, index signatures, `\| undefined` stripping |
| `buildBasicJsx.test.mjs` | `buildBasicJsx` | no props, boolean, string, number, complex types, max 2 attrs |
| `buildSections.test.mjs` | `buildSections` | 2 sections vs 3 sections, import statement format, events listing |

### Integration tests (`test/integration/`)

**`processComponent.test.mjs`** — calls the real async `processComponent(name, dir)` against
fixture `.d.ts` files. Validates the full output shape: title, description, sections, api.

**`dataIntegrity.test.mjs`** — loads the committed `components-data.json` and validates its
schema. All assertions use structural checks (not specific values) so the test suite stays
green after regenerating with a newer PrimeReact version:

- `data.version` matches `/^\d+\.\d+\.\d+/` (semver, not `=== '10.9.8'`)
- `data.components.length > 0` (not `=== 105`)
- Every component has `import` + `basic` sections
- Every `api.emits` entry starts with `"on"`
- `children` never appears in `api.props`

---

## v10 / v11 compatibility

The test suite is designed to survive a PrimeReact major version bump:

1. **Pure-function tests** use fixture files, not real PrimeReact — completely version-agnostic.
2. **`dataIntegrity.test.mjs`** validates schema shape, not specific component counts or version strings.
3. **`generate-data.mjs`** reads the installed `primereact/package.json` to set `data.version` dynamically (not hardcoded).

To validate v11 compatibility locally before release:

```bash
npm install --save-dev primereact@next   # or primereact@11 once released
npm run generate                          # regenerates components-data.json
npm test                                  # schema tests should still pass
```

---

## CI / GitHub Actions

Workflow: `.github/workflows/test.yml`

| Job | Runs on | Purpose |
|---|---|---|
| `test` | Node 18, 20, 22 (matrix) | Core test suite |
| `coverage` | Node 20 | Coverage report artifact |
| `v11-compat` | Node 20, `continue-on-error: true` | Installs `primereact@next`, regenerates data, re-runs tests |

The `v11-compat` job uses `continue-on-error: true` so it never blocks CI.
Once v11 is stable, change `PRIMEREACT_VERSION: next` to `'11'` in the workflow and remove `continue-on-error`.

---

## Adding tests for new code

1. Export the new function from `generate-data.mjs`
2. Create `test/unit/<functionName>.test.mjs`
3. Follow the import pattern:
   ```javascript
   import { describe, test, expect } from 'vitest';
   import { myNewFunction } from '../../generate-data.mjs';
   ```
4. Run `npm run test:coverage` to confirm coverage improved

For I/O-bound functions that read `.d.ts` files:
1. Add a fixture under `test/fixtures/<name>/<name>.d.ts`
2. Add test cases to `test/integration/processComponent.test.mjs`

---

## Using the `/unit-test` Claude skill

From within Claude Code, type `/unit-test` to:
- Run the suite and view results inline
- Generate missing test cases (`/unit-test --generate`)
- Get coverage breakdown (`/unit-test --coverage`)

See `.claude/skills/unit-test/skill.md` for full usage.
