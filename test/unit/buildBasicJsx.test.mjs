import { describe, test, expect } from 'vitest';
import { buildBasicJsx } from '../../generate-data.mjs';

const prop = (name, type) => ({ name, type, isEvent: false, description: '' });

describe('buildBasicJsx', () => {
    test('returns self-closing tag when no props are provided', () => {
        expect(buildBasicJsx('button', [])).toBe('<Button />');
    });

    test('formats boolean props without a value', () => {
        const result = buildBasicJsx('button', [prop('disabled', 'boolean')]);
        expect(result).toBe('<Button\n    disabled\n/>');
    });

    test('formats string props with a placeholder value', () => {
        const result = buildBasicJsx('button', [prop('label', 'string')]);
        expect(result).toBe('<Button\n    label="labelValue"\n/>');
    });

    test('formats number props with {value} placeholder', () => {
        const result = buildBasicJsx('button', [prop('tabIndex', 'number')]);
        expect(result).toBe('<Button\n    tabIndex={value}\n/>');
    });

    test('includes at most 2 attributes in the output', () => {
        const props = [
            prop('label', 'string'),
            prop('icon', 'string'),
            prop('disabled', 'boolean'),
        ];
        const result = buildBasicJsx('button', props);
        const attrCount = (result.match(/\n    \w/g) || []).length;
        expect(attrCount).toBeLessThanOrEqual(2);
    });

    test('falls back to self-closing tag when all props are complex types', () => {
        const result = buildBasicJsx('calendar', [prop('style', 'React.CSSProperties'), prop('value', 'Date')]);
        expect(result).toBe('<Calendar />');
    });

    test('capitalizes the component tag name', () => {
        const result = buildBasicJsx('inputtext', []);
        expect(result).toBe('<Inputtext />');
    });

    test('handles mixed primitive and complex props, using only primitives', () => {
        const props = [
            prop('style', 'React.CSSProperties'),
            prop('label', 'string'),
        ];
        const result = buildBasicJsx('button', props);
        expect(result).toContain('label="labelValue"');
        expect(result).not.toContain('style');
    });

    test('union-type string prop is formatted as string', () => {
        const result = buildBasicJsx('button', [prop('severity', "'success' | 'warning' | string")]);
        expect(result).toContain('severity="severityValue"');
    });
});
