import { describe, test, expect } from 'vitest';
import { processComponent } from '../../generate-data.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../fixtures');

describe('processComponent', () => {
    test('extracts button data (no events)', async () => {
        const result = await processComponent('button', fixturesDir);
        expect(result).not.toBeNull();
        expect(result.name).toBe('button');
        expect(result.title).toBe('React Button Component');
        expect(result.description).toBeTruthy();
        expect(result.sections.map(s => s.id)).toEqual(['import', 'basic']);
        expect(result.api.props.length).toBeGreaterThan(0);
        expect(result.api.emits).toHaveLength(0);
    });

    test('extracts dialog data with events', async () => {
        const result = await processComponent('dialog', fixturesDir);
        expect(result).not.toBeNull();
        expect(result.name).toBe('dialog');
        expect(result.sections.map(s => s.id)).toEqual(['import', 'basic', 'events']);
        expect(result.api.emits.length).toBeGreaterThan(0);
    });

    test('returns null for a component without module-level JSDoc', async () => {
        const result = await processComponent('nojsdoc', fixturesDir);
        expect(result).toBeNull();
    });

    test('returns null when the .d.ts file does not exist', async () => {
        const result = await processComponent('nonexistent', fixturesDir);
        expect(result).toBeNull();
    });

    test('excludes children from props', async () => {
        const result = await processComponent('dialog', fixturesDir);
        const propNames = result.api.props.map(p => p.name);
        expect(propNames).not.toContain('children');
    });

    test('all emits start with "on"', async () => {
        const result = await processComponent('dialog', fixturesDir);
        for (const emit of result.api.emits) {
            expect(emit.name).toMatch(/^on/);
        }
    });

    test('api always has the expected null fields', async () => {
        const result = await processComponent('button', fixturesDir);
        expect(result.api).toMatchObject({
            slots: null,
            pt: null,
            styles: null,
            tokens: null,
        });
    });

    test('each prop has name, type, and description', async () => {
        const result = await processComponent('button', fixturesDir);
        for (const prop of result.api.props) {
            expect(typeof prop.name).toBe('string');
            expect(typeof prop.type).toBe('string');
            expect(typeof prop.description).toBe('string');
        }
    });

    test('import section jsx contains the component module path', async () => {
        const result = await processComponent('button', fixturesDir);
        const importSection = result.sections.find(s => s.id === 'import');
        expect(importSection.examples.jsx).toContain("from 'primereact/button'");
    });

    test('falls back to any *Props interface when primary name does not match', async () => {
        // altprops fixture defines AltProps (not AltpropsProps), exercising the fallback branch
        const result = await processComponent('altprops', fixturesDir);
        expect(result).not.toBeNull();
        expect(result.api.props.length).toBeGreaterThan(0);
        expect(result.api.props[0].name).toBe('label');
        expect(result.api.emits.length).toBeGreaterThan(0);
        expect(result.api.emits[0].name).toBe('onClick');
    });

    test('props are separate from emits (no overlap)', async () => {
        const result = await processComponent('dialog', fixturesDir);
        const propNames = new Set(result.api.props.map(p => p.name));
        const emitNames = new Set(result.api.emits.map(e => e.name));
        for (const name of emitNames) {
            expect(propNames.has(name)).toBe(false);
        }
    });
});
