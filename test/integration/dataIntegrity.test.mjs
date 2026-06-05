/**
 * Schema validation for components-data.json.
 *
 * These tests deliberately avoid asserting specific counts or version numbers
 * so they pass unchanged after running `npm run generate` with any PrimeReact
 * version (v10, v11, etc.).
 */
import { describe, test, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '../../components-data.json');

let data;

beforeAll(async () => {
    const raw = await readFile(dataPath, 'utf-8');
    data = JSON.parse(raw);
});

describe('components-data.json — top-level schema', () => {
    test('has all required top-level fields', () => {
        expect(data).toHaveProperty('version');
        expect(data).toHaveProperty('generatedAt');
        expect(data).toHaveProperty('components');
        expect(data).toHaveProperty('pages');
    });

    test('version is a semver string', () => {
        expect(typeof data.version).toBe('string');
        expect(data.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    test('generatedAt is an ISO date string (YYYY-MM-DD)', () => {
        expect(data.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('components is a non-empty array', () => {
        expect(Array.isArray(data.components)).toBe(true);
        expect(data.components.length).toBeGreaterThan(0);
    });

    test('pages is an array', () => {
        expect(Array.isArray(data.pages)).toBe(true);
    });

    test('component names are unique (no duplicates)', () => {
        const names = data.components.map(c => c.name);
        expect(new Set(names).size).toBe(names.length);
    });
});

describe('components-data.json — per-component schema', () => {
    test('every component has required string fields', () => {
        for (const comp of data.components) {
            expect(typeof comp.name).toBe('string');
            expect(comp.name.length).toBeGreaterThan(0);
            expect(typeof comp.title).toBe('string');
            expect(typeof comp.description).toBe('string');
        }
    });

    test('every component has sections array', () => {
        for (const comp of data.components) {
            expect(Array.isArray(comp.sections)).toBe(true);
            expect(comp.sections.length).toBeGreaterThanOrEqual(2);
        }
    });

    test('every component has an import and a basic section', () => {
        for (const comp of data.components) {
            const ids = comp.sections.map(s => s.id);
            expect(ids).toContain('import');
            expect(ids).toContain('basic');
        }
    });

    test('import section has a jsx example referencing primereact', () => {
        for (const comp of data.components) {
            const importSection = comp.sections.find(s => s.id === 'import');
            expect(importSection).toBeDefined();
            expect(importSection.examples).toHaveProperty('jsx');
            expect(importSection.examples.jsx).toContain('primereact');
        }
    });

    test('import section jsx references the component name', () => {
        for (const comp of data.components) {
            const importSection = comp.sections.find(s => s.id === 'import');
            expect(importSection.examples.jsx).toContain(comp.name);
        }
    });

    test('every component api has the expected shape', () => {
        for (const comp of data.components) {
            expect(Array.isArray(comp.api.props)).toBe(true);
            expect(Array.isArray(comp.api.emits)).toBe(true);
            expect(comp.api.slots).toBeNull();
            expect(comp.api.pt).toBeNull();
            expect(comp.api.styles).toBeNull();
            expect(comp.api.tokens).toBeNull();
        }
    });

    test('every prop and emit has name, type, and description', () => {
        for (const comp of data.components) {
            for (const entry of [...comp.api.props, ...comp.api.emits]) {
                expect(typeof entry.name).toBe('string');
                expect(entry.name.length).toBeGreaterThan(0);
                expect(typeof entry.type).toBe('string');
                expect(typeof entry.description).toBe('string');
            }
        }
    });

    test('emits all start with "on"', () => {
        for (const comp of data.components) {
            for (const emit of comp.api.emits) {
                expect(emit.name).toMatch(/^on/);
            }
        }
    });

    test('props do not contain children', () => {
        for (const comp of data.components) {
            const propNames = comp.api.props.map(p => p.name);
            expect(propNames).not.toContain('children');
        }
    });
});
