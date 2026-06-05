import { describe, test, expect } from 'vitest';
import { extractInterfaceBody } from '../../generate-data.mjs';

describe('extractInterfaceBody', () => {
    test('returns the body of a named interface', () => {
        const content = `export interface ButtonProps {\n    label?: string;\n    disabled?: boolean;\n}`;
        const body = extractInterfaceBody(content, 'ButtonProps');
        expect(body).toContain('label?: string');
        expect(body).toContain('disabled?: boolean');
    });

    test('returns null when the interface is not found', () => {
        const content = `export interface OtherProps { value?: string; }`;
        expect(extractInterfaceBody(content, 'ButtonProps')).toBeNull();
    });

    test('correctly handles nested braces (generics)', () => {
        const content = `export interface TableProps {\n    style?: Record<string, { width: number }>;\n    rows?: number;\n}`;
        const body = extractInterfaceBody(content, 'TableProps');
        expect(body).toContain('style');
        expect(body).toContain('rows');
    });

    test('returns only the named interface body when multiple interfaces exist', () => {
        const content = `
export interface PropsA { a?: string; }
export interface ButtonProps { label?: string; disabled?: boolean; }
export interface PropsC { c?: number; }`;
        const body = extractInterfaceBody(content, 'ButtonProps');
        expect(body).toContain('label');
        expect(body).toContain('disabled');
        expect(body).not.toContain('PropsA');
        expect(body).not.toContain('PropsC');
    });

    test('handles interfaces with extends clause', () => {
        const content = `export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {\n    label?: string;\n}`;
        const body = extractInterfaceBody(content, 'ButtonProps');
        expect(body).toContain('label');
    });

    test('returns null when interface keyword is present but has no opening brace', () => {
        const content = `interface ButtonProps`;
        expect(extractInterfaceBody(content, 'ButtonProps')).toBeNull();
    });
});
