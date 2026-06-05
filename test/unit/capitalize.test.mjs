import { describe, test, expect } from 'vitest';
import { capitalize } from '../../generate-data.mjs';

describe('capitalize', () => {
    test('capitalizes the first character of a lowercase word', () => {
        expect(capitalize('button')).toBe('Button');
    });

    test('capitalizes multi-word camelCase identifiers', () => {
        expect(capitalize('dataTable')).toBe('DataTable');
    });

    test('returns empty string unchanged', () => {
        expect(capitalize('')).toBe('');
    });

    test('leaves already-capitalized strings unchanged', () => {
        expect(capitalize('Button')).toBe('Button');
    });

    test('handles single-character strings', () => {
        expect(capitalize('a')).toBe('A');
        expect(capitalize('B')).toBe('B');
    });
});
