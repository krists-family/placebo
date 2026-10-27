import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=join(root,'.next/standalone');
const server=join(output,'server.js');
if(!existsSync(server))throw new Error('Build the storefront with pnpm build:next before starting it.');
cpSync(join(root,'public'),join(output,'public'),{recursive:true});
cpSync(join(root,'.next/static'),join(output,'.next/static'),{recursive:true});
await import(pathToFileURL(server).href);
