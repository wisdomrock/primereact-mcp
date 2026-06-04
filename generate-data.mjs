#!/usr/bin/env node
/**
 * Generates components-data.json from primereact v10 TypeScript definitions.
 * Requires primereact to be installed (npm install primereact@10).
 * Run once: node generate-data.mjs
 */
import { readdir, readFile, writeFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve primereact location: local node_modules → parent node_modules → global
async function findPrimereactDir() {
    const candidates = [
        join(__dirname, 'node_modules/primereact'),
        join(__dirname, '../primereact'),
        join(__dirname, '../../primereact'),
    ];
    // Also check NODE_PATH entries
    if (process.env.NODE_PATH) {
        for (const p of process.env.NODE_PATH.split(':')) {
            candidates.push(join(p, 'primereact'));
        }
    }
    // Try require.resolve as a fallback
    try {
        const req = createRequire(import.meta.url);
        const pkgPath = req.resolve('primereact/package.json');
        candidates.unshift(dirname(pkgPath));
    } catch { /* not resolvable */ }

    for (const candidate of candidates) {
        try {
            await access(join(candidate, 'package.json'));
            return candidate;
        } catch { /* continue */ }
    }
    throw new Error(
        'Cannot find primereact. Install it first:\n  npm install primereact@10'
    );
}

const primereactDir = await findPrimereactDir();
console.error(`Using primereact from: ${primereactDir}`);

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Extract the module-level description from the file's first /** */ block
function extractModuleDescription(content) {
    const match = content.match(/^\/\*\*([\s\S]*?)\*\//);
    if (!match) return '';
    return match[1]
        .split('\n')
        .map(l => l.replace(/^\s*\*\s?/, '').trim())
        .filter(l => l && !l.startsWith('@') && !l.startsWith('[') && l !== '')
        .join(' ')
        .trim();
}

// Find a named interface block and return its body text
function extractInterfaceBody(content, interfaceName) {
    const idx = content.indexOf(`interface ${interfaceName}`);
    if (idx === -1) return null;

    let start = content.indexOf('{', idx);
    if (start === -1) return null;

    let depth = 0;
    let end = start;
    for (let i = start; i < content.length; i++) {
        if (content[i] === '{') depth++;
        else if (content[i] === '}') {
            depth--;
            if (depth === 0) { end = i; break; }
        }
    }
    return content.slice(start + 1, end);
}

// Parse props from an interface body string
function parseProps(body) {
    const props = [];
    // Split on property lines: identifier followed by ?: or : and ending with ;
    // We walk line by line, accumulating JSDoc and then emitting on a prop line
    const lines = body.split('\n');
    let jsdocLines = [];
    let inJsDoc = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('/**')) {
            inJsDoc = true;
            jsdocLines = [];
            continue;
        }
        if (inJsDoc) {
            if (trimmed === '*/') {
                inJsDoc = false;
                continue;
            }
            const text = trimmed.replace(/^\*\s?/, '').trim();
            if (text && !text.startsWith('@')) jsdocLines.push(text);
            continue;
        }

        // Match a property declaration: name?: type; or name: type;
        const propMatch = trimmed.match(/^(\w+)\??:\s*(.+?);?\s*$/);
        if (propMatch && !trimmed.startsWith('//') && !trimmed.startsWith('[')) {
            const [, name, rawType] = propMatch;
            // Skip index signatures and generic helpers
            if (name === 'children') { jsdocLines = []; continue; }

            const description = jsdocLines.join(' ').trim() || `The ${name} prop.`;
            const type = rawType.replace(/\s*\|\s*undefined$/, '').trim();
            const isEvent = name.startsWith('on') && type.includes('=>');

            props.push({ name, type, description, isEvent });
            jsdocLines = [];
        } else {
            jsdocLines = [];
        }
    }
    return props;
}

function buildSections(componentName, regularProps, eventProps) {
    const importStmt = `import { ${capitalize(componentName)} } from 'primereact/${componentName}';`;
    const basicExample = buildBasicJsx(componentName, regularProps.slice(0, 3));

    return [
        {
            id: 'import',
            label: 'Import',
            description: `Import the ${capitalize(componentName)} component from primereact.`,
            examples: { jsx: importStmt }
        },
        {
            id: 'basic',
            label: 'Basic',
            description: `Basic usage of the ${capitalize(componentName)} component.`,
            examples: { jsx: basicExample }
        },
        ...(eventProps.length > 0 ? [{
            id: 'events',
            label: 'Events',
            description: `Event callbacks supported by ${capitalize(componentName)}: ${eventProps.map(e => e.name).join(', ')}.`,
            examples: null
        }] : [])
    ];
}

function buildBasicJsx(name, sampleProps) {
    const tag = capitalize(name);
    if (sampleProps.length === 0) return `<${tag} />`;
    const attrs = sampleProps
        .filter(p => ['string', 'boolean', 'number'].some(t => p.type.includes(t)))
        .slice(0, 2)
        .map(p => {
            if (p.type.includes('boolean')) return `${p.name}`;
            if (p.type.includes('string')) return `${p.name}="${p.name}Value"`;
            return `${p.name}={value}`;
        })
        .join('\n    ');
    return attrs ? `<${tag}\n    ${attrs}\n/>` : `<${tag} />`;
}

async function processComponent(name) {
    const dtsPath = join(primereactDir, name, `${name}.d.ts`);
    try {
        await access(dtsPath);
    } catch {
        return null;
    }

    const content = await readFile(dtsPath, 'utf-8');
    const description = extractModuleDescription(content);
    if (!description) return null; // skip utility/internal modules

    // Find the primary Props interface: try exact match then any Props interface
    const primaryName = capitalize(name) + 'Props';
    let body = extractInterfaceBody(content, primaryName);
    if (!body) {
        // Some components use a different name (e.g. CalendarProps for calendar)
        const match = content.match(/export interface (\w+Props)/);
        if (match) body = extractInterfaceBody(content, match[1]);
    }

    const allProps = body ? parseProps(body) : [];
    const regularProps = allProps.filter(p => !p.isEvent);
    const eventProps = allProps.filter(p => p.isEvent);

    return {
        name,
        title: `React ${capitalize(name)} Component`,
        description,
        sections: buildSections(name, regularProps, eventProps),
        api: {
            props: regularProps.map(({ name, type, description }) => ({ name, type, description })),
            emits: eventProps.map(({ name, type, description }) => ({ name, type, description })),
            slots: null,
            pt: null,
            styles: null,
            tokens: null
        }
    };
}

async function main() {
    console.error('Scanning primereact v10 components...');
    const entries = await readdir(primereactDir);
    const components = [];
    let skipped = 0;

    for (const entry of entries) {
        // Skip utility directories
        if (['api', 'utils', 'hooks', 'componentbase', 'passthrough', 'csstransition', 'icons'].includes(entry)) continue;
        const component = await processComponent(entry);
        if (component) {
            components.push(component);
        } else {
            skipped++;
        }
    }

    const data = {
        version: '10.9.8',
        generatedAt: new Date().toISOString().split('T')[0],
        components,
        pages: []
    };

    const outPath = join(__dirname, 'components-data.json');
    await writeFile(outPath, JSON.stringify(data, null, 2), 'utf-8');
    console.error(`Done. ${components.length} components, ${skipped} skipped. Written to ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });