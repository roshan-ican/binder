import { mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = 'dist';
const client = path.join(dist, 'client');
const staging = path.join(dist, '.client-staging');

await rm(staging, { recursive: true, force: true });
await rm(client, { recursive: true, force: true });
await mkdir(staging, { recursive: true });

for (const entry of await readdir(dist)) {
  if (entry === 'client' || entry === 'server' || entry === '.openai' || entry === '.client-staging') {
    continue;
  }

  await rename(path.join(dist, entry), path.join(staging, entry));
}

await rename(staging, client);

const worker = `const INDEX_PATH = '/index.html';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || url.pathname.includes('.')) {
      return response;
    }

    return env.ASSETS.fetch(new Request(new URL(INDEX_PATH, url.origin), request));
  },
};
`;

await mkdir('dist/server', { recursive: true });
await writeFile('dist/server/index.js', worker);
await writeFile(
  'dist/wrangler.json',
  JSON.stringify(
    {
      name: 'binder-preview',
      main: 'server/index.js',
      compatibility_date: '2026-08-30',
      assets: {
        directory: 'client',
        binding: 'ASSETS',
        not_found_handling: 'single-page-application',
      },
    },
    null,
    2,
  ),
);
