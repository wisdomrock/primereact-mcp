import { describe, test, expect } from 'vitest';
import { parseProps } from '../../generate-data.mjs';

describe('parseProps', () => {
    test('parses a simple optional string prop', () => {
        const body = `    label?: string;`;
        const result = parseProps(body);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ name: 'label', type: 'string', isEvent: false });
    });

    test('parses a required prop (no ?)', () => {
        const body = `    label: string;`;
        const result = parseProps(body);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('label');
    });

    test('preserves JSDoc description', () => {
        const body = `    /**\n     * The text label of the button.\n     */\n    label?: string;`;
        const result = parseProps(body);
        expect(result[0].description).toBe('The text label of the button.');
    });

    test('uses default description when no JSDoc is present', () => {
        const body = `    icon?: string;`;
        const result = parseProps(body);
        expect(result[0].description).toBe('The icon prop.');
    });

    test('identifies event props (starts with "on" and contains "=>")', () => {
        const body = `    onChange?: (e: Event) => void;`;
        const result = parseProps(body);
        expect(result[0].isEvent).toBe(true);
        expect(result[0].name).toBe('onChange');
    });

    test('does NOT classify non-event on-prefixed props as events', () => {
        const body = `    onText?: string;`;
        const result = parseProps(body);
        expect(result[0].isEvent).toBe(false);
    });

    test('skips the children prop', () => {
        const body = `    children?: React.ReactNode;\n    label?: string;`;
        const result = parseProps(body);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('label');
    });

    test('skips index signatures ([key: string]: any)', () => {
        const body = `    [key: string]: any;\n    label?: string;`;
        const result = parseProps(body);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('label');
    });

    test('strips "| undefined" suffix from types', () => {
        const body = `    value?: string | undefined;`;
        const result = parseProps(body);
        expect(result[0].type).toBe('string');
    });

    test('handles multiple props in order', () => {
        const body = `    label?: string;\n    disabled?: boolean;\n    tabIndex?: number;`;
        const result = parseProps(body);
        expect(result.map(p => p.name)).toEqual(['label', 'disabled', 'tabIndex']);
    });

    test('handles union type severity prop', () => {
        const body = `    severity?: 'success' | 'warning' | 'danger';`;
        const result = parseProps(body);
        expect(result[0].type).toBe("'success' | 'warning' | 'danger'");
        expect(result[0].isEvent).toBe(false);
    });

    test('returns empty array for empty interface body', () => {
        expect(parseProps('')).toEqual([]);
        expect(parseProps('   \n  \n  ')).toEqual([]);
    });

    test('clears JSDoc buffer when a non-prop line interrupts', () => {
        const body = `    /**\n     * Stale comment.\n     */\n    // some comment\n    label?: string;`;
        const result = parseProps(body);
        expect(result[0].description).toBe('The label prop.');
    });
});
