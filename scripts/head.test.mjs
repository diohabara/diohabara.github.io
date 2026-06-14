import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Head includes Hatena Bookmark no-comment directive', async () => {
  const source = await readFile(new URL('../src/components/Head.astro', import.meta.url), 'utf8');

  assert.match(
    source,
    /<meta\s+name="Hatena::Bookmark"\s+content="nocomment"\s*\/?>/,
  );
});

test('Head can mark a page as noindex', async () => {
  const source = await readFile(new URL('../src/components/Head.astro', import.meta.url), 'utf8');

  assert.match(source, /noIndex\?:\s*boolean/);
  assert.match(source, /<meta\s+name="robots"\s+content="noindex,\s*follow"\s*\/?>/);
});

test('404 page uses shared head and opts out of indexing', async () => {
  const source = await readFile(new URL('../src/pages/404.astro', import.meta.url), 'utf8');

  assert.match(source, /import Layout from ['"]\.\.\/layouts\/Layout\.astro['"]/);
  assert.match(source, /<Layout[^>]*title="404"/);
  assert.match(source, /<Layout[^>]*noIndex/);
  assert.match(source, /<Layout[^>]*pagefindIgnore/);
});

test('Layout can exclude a whole page from Pagefind', async () => {
  const source = await readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');

  assert.match(source, /pagefindIgnore\?:\s*boolean/);
  assert.match(source, /data-pagefind-ignore=\{pagefindIgnore\s*\?\s*'all'\s*:\s*undefined\}/);
});
