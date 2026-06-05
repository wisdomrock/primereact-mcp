import { describe, test, expect } from 'vitest';
import { extractModuleDescription } from '../../generate-data.mjs';

describe('extractModuleDescription', () => {
    test('extracts description from a standard JSDoc block', () => {
        const content = `/**\n * Button is a form element.\n */\nexport interface ButtonProps {}`;
        expect(extractModuleDescription(content)).toBe('Button is a form element.');
    });

    test('joins multi-line descriptions with a space', () => {
        const content = `/**\n * First line.\n * Second line.\n */\nexport {};`;
        expect(extractModuleDescription(content)).toBe('First line. Second line.');
    });

    test('returns empty string when no JSDoc block is present', () => {
        expect(extractModuleDescription('// just a comment\nexport {};')).toBe('');
    });

    test('strips @tag lines from the description', () => {
        const content = `/**\n * Description text.\n * @module Button\n * @deprecated\n */`;
        expect(extractModuleDescription(content)).toBe('Description text.');
    });

    test('strips lines that start with [ (link markers)', () => {
        // Only lines whose FIRST character is "[" are stripped (e.g. "[Homepage](url)").
        // Inline links mid-sentence are preserved.
        const content = `/**\n * [Homepage](https://primereact.org)\n * Actual description.\n */`;
        expect(extractModuleDescription(content)).toBe('Actual description.');
    });

    test('preserves lines that contain [ but do not start with [', () => {
        const content = `/**\n * See [primereact.org] for details.\n */`;
        expect(extractModuleDescription(content)).toBe('See [primereact.org] for details.');
    });

    test('trims leading asterisks and whitespace from each line', () => {
        const content = `/**\n *   Trimmed text.  \n */`;
        expect(extractModuleDescription(content)).toBe('Trimmed text.');
    });

    test('returns empty string for an empty JSDoc block', () => {
        expect(extractModuleDescription('/** */\nexport {};')).toBe('');
    });

    test('handles content starting with non-JSDoc comment', () => {
        expect(extractModuleDescription('// single line\n/** Real desc. */\nexport {};')).toBe('');
    });
});
