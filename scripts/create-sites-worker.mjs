import { mkdir, writeFile } from 'node:fs/promises';

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
