#!/usr/bin/env node
import { runPrimeMcpServer } from '@primeuix/mcp';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

runPrimeMcpServer({
    name: 'primereact-mcp',
    version: '10.9.8',
    frameworkName: 'PrimeReact',
    baseUrl: 'https://primereact.org',
    slotKey: 'slots',
    codeLanguage: 'jsx',
    compatibility: 'React 18+, PrimeReact 10.x',
    loadComponentsData: async () => {
        const raw = await readFile(join(__dirname, 'components-data.json'), 'utf-8');
        return JSON.parse(raw);
    }
});