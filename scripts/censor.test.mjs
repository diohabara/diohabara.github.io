import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildContentHash,
  parseArticle,
  renderArticle,
  runtimeModelName,
  setAiReview,
} from './censor.mjs';

test('runtimeModelName strips the stored ollama id suffix', () => {
  assert.equal(runtimeModelName('qwen3:latest@500a1f067a9f'), 'qwen3:latest');
});

test('buildContentHash ignores aiReview but tracks ordinary frontmatter and body', () => {
  const base = [
    '---',
    'title: "Title"',
    'date: 2026-05-07',
    'aiReview:',
    '  reviewedAt: "2026-05-07T00:30:00+09:00"',
    '  contentHash: "sha256:old"',
    '  results:',
    '    - model: "qwen3:latest@500a1f067a9f"',
    '      verdict: "APPROVED"',
    '      comment: "ok"',
    '---',
    '',
    '本文',
    '',
  ].join('\n');
  const changedReview = base.replace('comment: "ok"', 'comment: "still ok"');
  const changedTitle = base.replace('title: "Title"', 'title: "Changed"');
  const changedBody = base.replace('本文', '本文 changed');

  assert.equal(buildContentHash(base), buildContentHash(changedReview));
  assert.notEqual(buildContentHash(base), buildContentHash(changedTitle));
  assert.notEqual(buildContentHash(base), buildContentHash(changedBody));
});

test('setAiReview renders aiReview as the final frontmatter block', () => {
  const raw = [
    '---',
    'title: "Title"',
    'date: 2026-05-07',
    'tags: ["memo"]',
    '---',
    '',
    '本文',
    '',
  ].join('\n');
  const article = parseArticle(raw);
  const next = renderArticle(
    setAiReview(article, {
      reviewedAt: '2026-05-07T00:30:00+09:00',
      contentHash: 'sha256:abc',
      results: [
        {
          model: 'llama3.1:8b@46e0c10c039e',
          verdict: 'APPROVED',
          comment: '問題ありません。',
        },
      ],
    })
  );

  assert.match(next, /tags: \["memo"\]\naiReview:\n/);
  assert.match(next, /reviewedAt: "2026-05-07T00:30:00\+09:00"/);
  assert.match(next, /contentHash: "sha256:abc"/);
  assert.match(next, /model: "llama3\.1:8b@46e0c10c039e"/);
  assert.match(next, /comment: "問題ありません。"/);
  assert.match(next, /\n---\n\n本文\n$/);
});
