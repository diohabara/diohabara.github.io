#!/usr/bin/env node
// 3-AI censorship for blog articles. Talks to Ollama's OpenAI-compatible endpoint.
//
// Usage:
//   node scripts/censor.mjs                     # check staged content/blog/*.md, exit 1 on fail
//   node scripts/censor.mjs --check-only        # same as above (explicit)
//   node scripts/censor.mjs <file...>           # check explicit files
//   node scripts/censor.mjs --trailer <msgfile> # append Reviewed-By trailer if staged files pass
//
// Env:
//   CENSOR_BASE_URL  override for runtime (default http://127.0.0.1:11434/v1)

import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

const BASE_URL = process.env.CENSOR_BASE_URL ?? 'http://127.0.0.1:11434/v1';
const OLLAMA_ROOT = BASE_URL.replace(/\/v1\/?$/, '');
const MODELS = [
  { id: 'llama3.1:8b', country: '米' },
  { id: 'qwen3:8b', country: '中' },
  { id: 'llm-jp-3', country: '日' },
];
const TIMEOUT_MS = 60_000;
const CACHE_REL = '.git/censor-result.json';

const GIT_ROOT = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return process.cwd();
  }
})();

const args = process.argv.slice(2);
const mode = parseMode(args);

try {
  if (mode.type === 'trailer') {
    await runTrailerMode(mode.msgFile);
  } else if (mode.type === 'check-staged') {
    await runCheckMode({ source: 'staged' });
  } else {
    await runCheckMode({ source: 'explicit', files: mode.files });
  }
} catch (err) {
  console.error('[censor] 予期しないエラー:', err.message);
  process.exit(2);
}

function parseMode(args) {
  if (args[0] === '--trailer' && args[1]) {
    return { type: 'trailer', msgFile: args[1] };
  }
  if (args.length === 0 || args[0] === '--check-only') {
    return { type: 'check-staged' };
  }
  return { type: 'check-explicit', files: args };
}

async function runCheckMode({ source, files }) {
  const targetFiles = source === 'staged' ? getStagedMarkdown() : files;
  if (targetFiles.length === 0) {
    console.log('[censor] 対象の content/blog/*.md なし。スキップ。');
    return;
  }
  await ensureOllama();
  const constitution = await loadConstitution();
  const results = [];
  for (const file of targetFiles) {
    const absPath = path.isAbsolute(file) ? file : path.join(GIT_ROOT, file);
    const content = await readFile(absPath, 'utf8');
    const heuristicLeak = detectSecretLeak(content);
    const r = await reviewFile({ file, content, constitution, heuristicLeak });
    results.push(r);
    printResult(r);
  }
  if (source === 'staged') {
    writeCache(results);
  }
  const allPass = results.every((r) => r.passed);
  if (!allPass) {
    console.error('\n[censor] 憲法違反により commit を中止しました。');
    process.exit(1);
  }
  console.log('\n[censor] すべての記事が憲法に準拠しています。');
}

async function runTrailerMode(msgFile) {
  let results = readCache();
  if (!results) {
    const files = getStagedMarkdown();
    if (files.length === 0) return;
    await ensureOllama();
    const constitution = await loadConstitution();
    results = [];
    for (const file of files) {
      const absPath = path.join(GIT_ROOT, file);
      const content = await readFile(absPath, 'utf8');
      const heuristicLeak = detectSecretLeak(content);
      const r = await reviewFile({ file, content, constitution, heuristicLeak });
      results.push(r);
      printResult(r);
    }
    if (!results.every((r) => r.passed)) {
      console.error('[censor] 憲法違反あり。trailer を付与せず、commit を中止します。');
      process.exit(1);
    }
  }
  if (results.length === 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const modelList = MODELS.map((m) => m.id).join(', ');
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

async function ensureOllama() {
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
  const available = new Set((body.models ?? []).map((m) => m.name));
  const missing = MODELS.filter(
    (m) => !available.has(m.id) && !available.has(`${m.id}:latest`)
  );
  if (missing.length) {
    console.error('[censor] 必要なモデルが未取得です:');
    for (const m of missing) {
      if (m.id === 'llm-jp-3') {
        console.error(
          `  - ${m.id}: README のセットアップ手順に従い scripts/llm-jp-3.Modelfile から登録してください`
        );
      } else {
        console.error(`  - ${m.id}: ollama pull ${m.id}`);
      }
    }
    process.exit(1);
  }
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

const SECRET_PATTERNS = [
  { name: 'Anthropic API key', re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'Bearer token', re: /Bearer\s+[A-Za-z0-9._-]{20,}/ },
  { name: 'Google API key', re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'Email address', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { name: 'Phone (JP)', re: /\b0\d{1,4}-\d{1,4}-\d{4}\b/ },
];

function detectSecretLeak(content) {
  return SECRET_PATTERNS.filter((p) => p.re.test(content)).map((p) => p.name);
}

async function reviewFile({ file, content, constitution, heuristicLeak }) {
  const verdicts = [];
  for (const model of MODELS) {
    const v = await reviewWithModel({ model, file, content, constitution });
    verdicts.push(v);
  }
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
      `${BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      },
      TIMEOUT_MS
    );
    if (!res.ok) {
      return { model: model.id, verdict: 'ABSTAIN', reason: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';
    const parsed = tryParseJson(raw);
    if (!parsed || !parsed.verdict) {
      return { model: model.id, verdict: 'ABSTAIN', reason: 'JSONパース失敗' };
    }
    const v = String(parsed.verdict).toUpperCase();
    if (v !== 'APPROVED' && v !== 'REJECTED') {
      return { model: model.id, verdict: 'ABSTAIN', reason: `不明な verdict: ${v}` };
    }
    return {
      model: model.id,
      verdict: v,
      reason: String(parsed.reason ?? '').slice(0, 200),
    };
  } catch (err) {
    const isTimeout =
      err.name === 'AbortError' || /abort|timeout/i.test(err.message);
    return {
      model: model.id,
      verdict: 'ABSTAIN',
      reason: isTimeout ? 'タイムアウト' : err.message.slice(0, 100),
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

function printResult(r) {
  const badge = r.passed ? '✓ APPROVED' : '✗ REJECTED';
  console.log(
    `\n${badge}  ${r.file}  (${r.approves}/${MODELS.length} 承認, 回答${r.responded}件)`
  );
  for (const v of r.verdicts) {
    console.log(`  [${v.model}] ${v.verdict}: ${v.reason}`);
  }
  if (r.heuristicLeak.length > 0) {
    console.log(
      `  [heuristic] 機密情報らしきパターン検出: ${r.heuristicLeak.join(', ')}`
    );
  }
}

function writeCache(results) {
  try {
    const payload = {
      timestamp: Date.now(),
      passed: results.every((r) => r.passed),
      files: results.map((r) => ({
        file: r.file,
        hash: hashFile(r.file),
        passed: r.passed,
      })),
    };
    writeFileSync(path.join(GIT_ROOT, CACHE_REL), JSON.stringify(payload, null, 2));
  } catch (err) {
    console.warn('[censor] キャッシュ書き込み失敗:', err.message);
  }
}

function readCache() {
  try {
    const p = path.join(GIT_ROOT, CACHE_REL);
    if (!existsSync(p)) return null;
    const payload = JSON.parse(readFileSync(p, 'utf8'));
    if (Date.now() - payload.timestamp > 10 * 60_000) return null;
    for (const f of payload.files) {
      if (hashFile(f.file) !== f.hash) return null;
    }
    if (!payload.passed) return null;
    return payload.files.map((f) => ({ file: f.file, passed: f.passed }));
  } catch {
    return null;
  }
}

function hashFile(file) {
  try {
    const content = readFileSync(path.join(GIT_ROOT, file));
    return createHash('sha256').update(content).digest('hex');
  } catch {
    return '';
  }
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
