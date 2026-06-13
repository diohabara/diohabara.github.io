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
