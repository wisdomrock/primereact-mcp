import { describe, test, expect } from 'vitest';
import { buildSections } from '../../generate-data.mjs';

const prop = (name, type) => ({ name, type, isEvent: false, description: '' });
const event = (name, type) => ({ name, type, isEvent: true, description: '' });

describe('buildSections', () => {
    test('returns 2 sections (import + basic) when there are no events', () => {
        const sections = buildSections('button', [prop('label', 'string')], []);
        expect(sections).toHaveLength(2);
        expect(sections.map(s => s.id)).toEqual(['import', 'basic']);
    });

    test('returns 3 sections (import + basic + events) when events are present', () => {
        const sections = buildSections('dialog', [prop('header', 'string')], [event('onHide', '() => void')]);
        expect(sections).toHaveLength(3);
        expect(sections.map(s => s.id)).toEqual(['import', 'basic', 'events']);
    });

    test('import section contains a valid import statement', () => {
        const [importSection] = buildSections('button', [], []);
        expect(importSection.examples.jsx).toBe("import { Button } from 'primereact/button';");
    });

    test('import section description mentions the component name', () => {
        const [importSection] = buildSections('button', [], []);
        expect(importSection.description).toContain('Button');
    });

    test('basic section description mentions the component name', () => {
        const [, basicSection] = buildSections('button', [], []);
        expect(basicSection.description).toContain('Button');
    });

    test('basic section examples contains jsx', () => {
        const [, basicSection] = buildSections('button', [prop('label', 'string')], []);
        expect(basicSection.examples).toHaveProperty('jsx');
        expect(typeof basicSection.examples.jsx).toBe('string');
    });

    test('events section lists all event names in description', () => {
        const events = [event('onHide', '() => void'), event('onShow', '() => void')];
        const sections = buildSections('dialog', [], events);
        const eventsSection = sections.find(s => s.id === 'events');
        expect(eventsSection.description).toContain('onHide');
        expect(eventsSection.description).toContain('onShow');
    });

    test('events section has null examples', () => {
        const sections = buildSections('dialog', [], [event('onHide', '() => void')]);
        const eventsSection = sections.find(s => s.id === 'events');
        expect(eventsSection.examples).toBeNull();
    });

    test('capitalizes multi-word component names in import', () => {
        const [importSection] = buildSections('datatable', [], []);
        expect(importSection.examples.jsx).toBe("import { Datatable } from 'primereact/datatable';");
    });
});
