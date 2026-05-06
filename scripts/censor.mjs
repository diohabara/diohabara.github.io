#!/usr/bin/env node
// 3-AI censorship for blog articles. Talks to Ollama's local API.
//
// Usage:
//   node scripts/censor.mjs                       # check staged content/blog/*.md, exit 1 on fail
//   node scripts/censor.mjs --check-only          # same as above (explicit)
//   node scripts/censor.mjs <file...>             # check explicit files without writing
//   node scripts/censor.mjs --write <file...>     # write aiReview frontmatter for explicit files
//   node scripts/censor.mjs --write-staged        # pre-commit mode: write stale staged reviews and git add
//   node scripts/censor.mjs --trailer <msgfile>   # append Reviewed-By trailer if staged files pass
//
// Env:
//   CENSOR_BASE_URL  override for runtime (default http://127.0.0.1:11434/v1)
//   CENSOR_TIMEOUT_MS  per-model timeout in milliseconds (default 180000)

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.CENSOR_BASE_URL ?? 'http://127.0.0.1:11434/v1';
const OLLAMA_ROOT = BASE_URL.replace(/\/v1\/?$/, '');
const LLM_JP_MODEL = 'hf.co/mmnga/llm-jp-3.1-1.8b-instruct4-gguf:Q4_K_M';
const MODEL_DEFINITIONS = [
  { name: 'llama3.1:8b', pull: 'llama3.1:8b', country: '米' },
  { name: 'qwen3:latest', pull: 'qwen3', aliases: ['qwen3'], country: '中' },
  { name: LLM_JP_MODEL, pull: LLM_JP_MODEL, country: '日' },
];
const TIMEOUT_MS = Number(process.env.CENSOR_TIMEOUT_MS ?? 180_000);
const CACHE_FILE = 'censor-result.json';
const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
    reason: { type: 'string' },
  },
  required: ['verdict', 'reason'],
};

const SECRET_PATTERNS = [
  { name: 'Anthropic API key', re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'Bearer token', re: /Bearer\s+[A-Za-z0-9._-]{20,}/ },
  { name: 'Google API key', re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'Email address', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { name: 'Phone (JP)', re: /\b0\d{1,4}-\d{1,4}-\d{4}\b/ },
];

const GIT_ROOT = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return process.cwd();
  }
})();

let cachedModels = null;

if (isMainModule()) {
  try {
    await main(process.argv.slice(2));
  } catch (err) {
    console.error('[censor] 予期しないエラー:', err.message);
    process.exit(2);
  }
}

async function main(args) {
  const mode = parseMode(args);
  if (mode.type === 'trailer') {
    await runTrailerMode(mode.msgFile);
  } else if (mode.type === 'write-staged') {
    await runWriteStagedMode();
  } else if (mode.type === 'write-explicit') {
    await runCheckMode({ source: 'explicit', files: mode.files, write: true });
  } else if (mode.type === 'check-staged') {
    await runCheckMode({ source: 'staged', write: false });
  } else {
    await runCheckMode({ source: 'explicit', files: mode.files, write: false });
  }
}

function isMainModule() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function parseMode(args) {
  if (args[0] === '--trailer' && args[1]) {
    return { type: 'trailer', msgFile: args[1] };
  }
  if (args[0] === '--write-staged') {
    return { type: 'write-staged' };
  }
  if (args[0] === '--write') {
    return { type: 'write-explicit', files: args.slice(1) };
  }
  if (args.length === 0 || args[0] === '--check-only') {
    return { type: 'check-staged' };
  }
  return { type: 'check-explicit', files: args };
}

async function runCheckMode({ source, files = [], write }) {
  const targetFiles = source === 'staged' ? getStagedMarkdown() : files;
  if (targetFiles.length === 0) {
    console.log('[censor] 対象の content/blog/*.md なし。スキップ。');
    return;
  }
  const models = await ensureOllama();
  const constitution = await loadConstitution();
  const results = [];
  for (const file of targetFiles) {
    const absPath = path.isAbsolute(file) ? file : path.join(GIT_ROOT, file);
    const content =
      source === 'staged' ? readStagedFile(file) : await readFile(absPath, 'utf8');
    const r = await reviewFile({ file, content, constitution, models });
    results.push(r);
    printResult(r, models);
    if (write && r.passed) {
      writeAiReview(absPath, content, r);
      console.log(`  [aiReview] frontmatter を更新しました。`);
    }
  }
  exitIfRejected(results);
}

async function runWriteStagedMode() {
  const targetFiles = getStagedMarkdown();
  if (targetFiles.length === 0) {
    console.log('[censor] 対象の content/blog/*.md なし。スキップ。');
    return;
  }
  failOnMixedStagedAndUnstaged(targetFiles);

  const results = [];
  let models = null;
  let constitution = null;

  for (const file of targetFiles) {
    const absPath = path.join(GIT_ROOT, file);
    const content = await readFile(absPath, 'utf8');
    models ??= await ensureOllama();
    constitution ??= await loadConstitution();
    const r = await reviewFile({ file, content, constitution, models });
    results.push(r);
    printResult(r, models);
    if (r.passed) {
      writeAiReview(absPath, content, r);
      gitAdd(file);
      console.log('  [aiReview] frontmatter を更新して git add しました。');
    }
  }

  writeCache(results, models ?? collectModelsFromResults(results));
  exitIfRejected(results);
}

async function runTrailerMode(msgFile) {
  const files = getStagedMarkdown();
  if (files.length === 0) return;
  const cached = readCache(files);
  if (!cached) {
    console.error('[censor] pre-commit の検閲キャッシュがないため trailer を付与できません。');
    console.error('[censor] `git commit --no-verify` を使わず、pre-commit から検閲を実行してください。');
    process.exit(1);
  }
  if (!cached.results.every((r) => r.passed)) {
    console.error('[censor] 検閲に通過していない記事があるため trailer を付与できません。');
    process.exit(1);
  }
  const today = new Date().toISOString().slice(0, 10);
  const modelList = cached.models.map((m) => m.id).join(', ');
  const trailer = `Reviewed-By: 3-AI-Censor (${modelList}) APPROVED ${today}`;
  appendTrailerIfMissing(msgFile, trailer);
}

function getStagedMarkdown() {
  try {
    const out = execFileSync(
      'git',
      ['diff', '--cached', '--name-only', '--diff-filter=ACM'],
      { encoding: 'utf8', cwd: GIT_ROOT }
    );
    return out
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('content/blog/') && l.endsWith('.md'));
  } catch {
    return [];
  }
}

function failOnMixedStagedAndUnstaged(files) {
  const mixed = files.filter((file) => {
    try {
      execFileSync('git', ['diff', '--quiet', '--', file], { cwd: GIT_ROOT });
      return false;
    } catch {
      return true;
    }
  });
  if (mixed.length === 0) return;
  console.error('[censor] ステージ済み記事に未ステージ変更が混在しています。');
  console.error('[censor] aiReview を自動更新すると差分が混ざるため中止します:');
  for (const file of mixed) console.error(`  - ${file}`);
  process.exit(1);
}

async function ensureOllama() {
  if (cachedModels) return cachedModels;
  let body;
  try {
    const res = await fetchWithTimeout(`${OLLAMA_ROOT}/api/tags`, {}, 5000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    body = await res.json();
  } catch (err) {
    console.error('[censor] Ollama が応答しません。`ollama serve` を実行してください。');
    console.error(`  (CENSOR_BASE_URL=${BASE_URL}, 詳細: ${err.message})`);
    process.exit(1);
  }

  const available = body.models ?? [];
  const resolved = [];
  const missing = [];
  for (const def of MODEL_DEFINITIONS) {
    const aliases = new Set([def.name, ...(def.aliases ?? [])]);
    const found = available.find((m) => aliases.has(m.name));
    if (!found || !found.digest) {
      missing.push(def);
      continue;
    }
    resolved.push({
      ...def,
      name: found.name,
      id: `${found.name}@${found.digest.slice(0, 12)}`,
    });
  }
  if (missing.length) {
    console.error('[censor] 必要なモデルが未取得、または一意 ID を取得できません:');
    for (const m of missing) {
      console.error(`  - ${m.name}: ollama pull ${m.pull}`);
    }
    process.exit(1);
  }
  cachedModels = resolved;
  return resolved;
}

async function loadConstitution() {
  const p = path.join(GIT_ROOT, 'src/pages/constitution.astro');
  if (!existsSync(p)) return '(憲法ページが見つかりません)';
  const raw = await readFile(p, 'utf8');
  return raw
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectSecretLeak(content) {
  return SECRET_PATTERNS.filter((p) => p.re.test(content)).map((p) => p.name);
}

async function reviewFile({ file, content, constitution, models }) {
  const contentForReview = renderArticle(removeAiReview(parseArticle(content)));
  const heuristicLeak = detectSecretLeak(contentForReview);
  const verdicts = [];
  for (const model of models) {
    const v = await reviewWithModel({ model, file, content: contentForReview, constitution });
    verdicts.push(v);
  }
  return buildReviewResult({ file, verdicts, heuristicLeak });
}

function buildReviewResult({ file, verdicts, heuristicLeak }) {
  const approves = verdicts.filter((v) => v.verdict === 'APPROVED').length;
  const responded = verdicts.filter((v) => v.verdict !== 'ABSTAIN').length;
  const majorityPass = approves >= 2;
  const passed = majorityPass && heuristicLeak.length === 0;
  return { file, verdicts, heuristicLeak, passed, approves, responded };
}

async function reviewWithModel({ model, file, content, constitution }) {
  const systemPrompt = buildSystemPrompt(constitution);
  const userPrompt = buildUserPrompt(file, content);
  try {
    const res = await fetchWithTimeout(
      `${OLLAMA_ROOT}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: runtimeModelName(model.id),
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          format: VERDICT_SCHEMA,
          options: { temperature: 0.2 },
          ...(runtimeModelName(model.id).startsWith('qwen3') ? { think: false } : {}),
        }),
      },
      TIMEOUT_MS
    );
    if (!res.ok) {
      return { model: model.id, verdict: 'ABSTAIN', comment: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const raw = data.message?.content ?? '';
    const parsed = tryParseJson(raw);
    if (!parsed || !parsed.verdict) {
      return { model: model.id, verdict: 'ABSTAIN', comment: 'JSONパース失敗' };
    }
    const v = String(parsed.verdict).toUpperCase();
    if (v !== 'APPROVED' && v !== 'REJECTED') {
      return { model: model.id, verdict: 'ABSTAIN', comment: `不明な verdict: ${v}` };
    }
    return {
      model: model.id,
      verdict: v,
      comment: String(parsed.reason ?? '').slice(0, 200),
    };
  } catch (err) {
    const isTimeout =
      err.name === 'AbortError' || /abort|timeout/i.test(err.message);
    return {
      model: model.id,
      verdict: 'ABSTAIN',
      comment: isTimeout ? 'タイムアウト' : err.message.slice(0, 100),
    };
  }
}

function tryParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {}
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {}
  }
  return null;
}

function buildSystemPrompt(constitution) {
  return [
    'あなたはブログ記事の検閲者です。あなたを作った開発者の考える同時代の倫理観に従って判断してください。',
    '普遍倫理ではなく、あなたのトレーニング時点で開発者が埋め込んだ価値観を唯一の基準とします。',
    '',
    '以下の4つの評価軸で記事を判定してください:',
    '1. 下記「AI倫理憲法」の全文と矛盾しないか',
    '2. 明らかな事実誤認がないか',
    '3. 日本語として不自然な表現や読みにくさがないか',
    '4. 個人情報・機密情報(メール、電話、社外秘、API鍵など)が含まれていないか',
    '',
    '# AI倫理憲法',
    constitution,
    '',
    '# 応答形式',
    '次のJSONのみを返してください。前置き・後置き・コードフェンスは一切禁止です。',
    '{"verdict": "APPROVED" または "REJECTED", "reason": "短い日本語の理由"}',
  ].join('\n');
}

function buildUserPrompt(file, content) {
  return `以下の記事を判定してください。\n\nファイル名: ${file}\n\n---\n${content}\n---`;
}

async function fetchWithTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

function printResult(r, models) {
  const total = models.length || r.verdicts.length;
  const badge = r.passed ? '✓ APPROVED' : '✗ REJECTED';
  console.log(
    `\n${badge}  ${r.file}  (${r.approves}/${total} 承認, 回答${r.responded}件)`
  );
  for (const v of r.verdicts) {
    console.log(`  [${v.model}] ${v.verdict}: ${v.comment}`);
  }
  if (r.heuristicLeak.length > 0) {
    console.log(
      `  [heuristic] 機密情報らしきパターン検出: ${r.heuristicLeak.join(', ')}`
    );
  }
}

function exitIfRejected(results) {
  const allPass = results.every((r) => r.passed);
  if (!allPass) {
    console.error('\n[censor] 憲法違反により処理を中止しました。');
    process.exit(1);
  }
  console.log('\n[censor] すべての記事が憲法に準拠しています。');
}

function writeAiReview(absPath, content, reviewResult) {
  const article = parseArticle(content);
  const aiReview = {
    reviewedAt: formatTokyoIso(new Date()),
    contentHash: buildContentHash(content),
    results: reviewResult.verdicts.map((v) => ({
      model: v.model,
      verdict: v.verdict,
      comment: v.comment,
    })),
  };
  writeFileSync(absPath, renderArticle(setAiReview(article, aiReview)));
}

export function parseArticle(raw) {
  if (!raw.startsWith('---\n') && !raw.startsWith('---\r\n')) {
    return { frontmatter: '', body: raw };
  }
  const marker = raw.includes('\r\n') ? '\r\n---' : '\n---';
  const end = raw.indexOf(marker, 3);
  if (end === -1) return { frontmatter: '', body: raw };
  const delimiterEnd = end + marker.length;
  let body = raw.slice(delimiterEnd);
  if (body.startsWith('\r\n')) {
    body = body.slice(2);
  } else if (body.startsWith('\n')) {
    body = body.slice(1);
  }
  return {
    frontmatter: raw.slice(raw.indexOf('\n') + 1, end),
    body,
  };
}

export function renderArticle(article) {
  const frontmatter = article.frontmatter.trimEnd();
  return `---\n${frontmatter}\n---\n${article.body}`;
}

export function setAiReview(article, aiReview) {
  const frontmatter = stripAiReview(article.frontmatter).trimEnd();
  return {
    ...article,
    frontmatter: `${frontmatter}\n${formatAiReview(aiReview)}`,
  };
}

function removeAiReview(article) {
  return { ...article, frontmatter: stripAiReview(article.frontmatter).trimEnd() };
}

function stripAiReview(frontmatter) {
  const lines = frontmatter.split('\n');
  const kept = [];
  let skipping = false;
  for (const line of lines) {
    const isTopLevelKey = /^[A-Za-z0-9_-]+:\s*/.test(line);
    if (isTopLevelKey && /^aiReview:\s*/.test(line)) {
      skipping = true;
      continue;
    }
    if (skipping && isTopLevelKey) {
      skipping = false;
    }
    if (!skipping) kept.push(line);
  }
  return kept.join('\n');
}

function formatAiReview(aiReview) {
  return [
    'aiReview:',
    `  reviewedAt: ${yamlQuote(aiReview.reviewedAt)}`,
    `  contentHash: ${yamlQuote(aiReview.contentHash)}`,
    '  results:',
    ...aiReview.results.flatMap((r) => [
      `    - model: ${yamlQuote(r.model)}`,
      `      verdict: ${yamlQuote(r.verdict)}`,
      `      comment: ${yamlQuote(r.comment)}`,
    ]),
  ].join('\n');
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

export function buildContentHash(content) {
  const article = removeAiReview(parseArticle(content));
  const canonical = renderArticle(article);
  return `sha256:${createHash('sha256').update(canonical).digest('hex')}`;
}

export function runtimeModelName(storedModel) {
  return storedModel.split('@')[0];
}

function formatTokyoIso(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}+09:00`;
}

function writeCache(results, models) {
  try {
    const p = cachePath();
    const payload = {
      timestamp: Date.now(),
      passed: results.every((r) => r.passed),
      models: models.map((m) => ({ id: m.id })),
      files: results.map((r) => ({
        file: r.file,
        hash: hashStagedFile(r.file),
        passed: r.passed,
        verdicts: r.verdicts,
      })),
    };
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify(payload, null, 2));
  } catch (err) {
    console.warn('[censor] キャッシュ書き込み失敗:', err.message);
  }
}

function readCache(expectedFiles) {
  try {
    const p = cachePath();
    if (!existsSync(p)) return null;
    const payload = JSON.parse(readFileSync(p, 'utf8'));
    if (Date.now() - payload.timestamp > 10 * 60_000) return null;
    const cachedFiles = payload.files.map((f) => f.file).sort();
    const stagedFiles = [...expectedFiles].sort();
    if (JSON.stringify(cachedFiles) !== JSON.stringify(stagedFiles)) return null;
    for (const f of payload.files) {
      if (hashStagedFile(f.file) !== f.hash) return null;
    }
    if (!payload.passed) return null;
    const results = payload.files.map((f) =>
      buildReviewResult({
        file: f.file,
        verdicts: f.verdicts ?? [],
        heuristicLeak: [],
      })
    );
    return { results, models: payload.models ?? collectModelsFromResults(results) };
  } catch {
    return null;
  }
}

function cachePath() {
  const out = execFileSync('git', ['rev-parse', '--git-path', CACHE_FILE], {
    encoding: 'utf8',
    cwd: GIT_ROOT,
  }).trim();
  return path.isAbsolute(out) ? out : path.join(GIT_ROOT, out);
}

function collectModelsFromResults(results) {
  const ids = new Set();
  for (const result of results) {
    for (const verdict of result.verdicts) ids.add(verdict.model);
  }
  return [...ids].map((id) => ({ id }));
}

function hashFile(file) {
  try {
    const content = readFileSync(path.join(GIT_ROOT, file));
    return createHash('sha256').update(content).digest('hex');
  } catch {
    return '';
  }
}

function hashStagedFile(file) {
  try {
    return createHash('sha256').update(readStagedFile(file)).digest('hex');
  } catch {
    return hashFile(file);
  }
}

function readStagedFile(file) {
  return execFileSync('git', ['show', `:${file}`], {
    cwd: GIT_ROOT,
    encoding: 'utf8',
  });
}

function gitAdd(file) {
  execFileSync('git', ['add', '--', file], { cwd: GIT_ROOT, stdio: 'inherit' });
}

function appendTrailerIfMissing(msgFile, trailer) {
  const abs = path.isAbsolute(msgFile) ? msgFile : path.join(GIT_ROOT, msgFile);
  const cur = existsSync(abs) ? readFileSync(abs, 'utf8') : '';
  const prefix = trailer.split(' APPROVED ')[0];
  if (cur.includes(prefix)) return;
  const trimmedEnd = cur.replace(/\s+$/, '');
  const needsBlankLine = trimmedEnd.length > 0;
  const joined = (needsBlankLine ? trimmedEnd + '\n\n' : '') + trailer + '\n';
  writeFileSync(abs, joined);
}
