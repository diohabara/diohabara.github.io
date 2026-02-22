// mdast node builders for GitHub embeds

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Pick black or white text for a given hex background color. */
function getContrastColor(hex) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // W3C relative luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? '#000' : '#fff';
}

const ICON_GIST =
  '<svg class="gh-embed-icon" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M1.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75zM0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75zm9.22 3.72a.749.749 0 0 1 1.06 0l3.5 3.5a.749.749 0 0 1 0 1.06l-3.5 3.5a.749.749 0 1 1-1.06-1.06l2.97-2.97-2.97-2.97a.749.749 0 0 1 0-1.06zm-2.44 0a.749.749 0 0 1 0 1.06L3.81 9.75l2.97 2.97a.749.749 0 1 1-1.06 1.06l-3.5-3.5a.749.749 0 0 1 0-1.06l3.5-3.5a.749.749 0 0 1 1.06 0z"></path></svg>';

const ICON_REPO =
  '<svg class="gh-embed-icon" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011z"></path></svg>';

const ICON_ISSUE =
  '<svg class="gh-embed-icon" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path></svg>';

const ICON_PR =
  '<svg class="gh-embed-icon" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path></svg>';

/** Map file extension to a shiki-compatible language, or null for non-text. */
function extToLang(ext) {
  if (!ext) return null;
  const e = ext.toLowerCase();
  // Non-text / binary extensions — skip embedding
  const nonText = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp',
    'pdf', 'zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar',
    'exe', 'dll', 'so', 'dylib', 'bin', 'wasm',
    'mp3', 'mp4', 'wav', 'ogg', 'webm', 'mov', 'avi',
    'ttf', 'otf', 'woff', 'woff2', 'eot',
  ]);
  if (nonText.has(e)) return null;
  // Extension aliases that Shiki doesn't recognize natively
  const map = {
    'ipynb': 'json',
    'mjs': 'javascript',
    'cjs': 'javascript',
    'mts': 'typescript',
    'cts': 'typescript',
    'jsx': 'tsx',
    'h': 'c',
    'hpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
  };
  return map[e] ?? e;
}

/** Gist embed: always use GitHub's <script> tag for syntax highlighting + line numbers.
 *  CSS overrides in global.css handle dark mode and overflow. */
export function renderGistEmbed(url) {
  return {
    type: 'html',
    value: `<div class="gh-embed gh-embed-gist-fallback"><script src="${url}.js"><\/script></div>`,
  };
}

export function renderBlob(data, url, params) {
  const content = data.decoded_content ?? '';
  const ext = params.path.split('.').pop();
  const lang = extToLang(ext);

  // Binary / non-text files can't be embedded as code
  if (lang === null) return renderFallbackLink(url, 'blob');

  return [
    {
      type: 'html',
      value:
        `<div class="gh-embed gh-embed-blob">` +
        `<div class="gh-embed-header">` +
        ICON_REPO +
        `<a href="${url}" class="gh-embed-link" target="_blank" rel="noopener">${escapeHtml(params.owner)}/${escapeHtml(params.repo)} — ${escapeHtml(params.path)}</a>` +
        `<span class="gh-embed-ref">${escapeHtml(params.ref)}</span>` +
        `</div>`,
    },
    {
      type: 'code',
      lang,
      value: content.replace(/\n$/, ''),
    },
    { type: 'html', value: `</div>` },
  ];
}

export function renderIssueCard(data, url, type) {
  const icon = type === 'pr' ? ICON_PR : ICON_ISSUE;
  const typeLabel = type === 'pr' ? 'Pull Request' : 'Issue';

  const stateClass =
    data.state === 'open' ? 'gh-issue-open' : 'gh-issue-closed';
  const stateText = data.state === 'open' ? 'Open' : 'Closed';

  const labels = (data.labels || [])
    .map((l) => {
      const bg = l.color ? `#${l.color}` : 'var(--tag-bg)';
      const fg = l.color ? getContrastColor(l.color) : 'var(--tag-text)';
      return `<span class="gh-label" style="background:${bg};color:${fg}">${escapeHtml(l.name)}</span>`;
    })
    .join(' ');

  const user = data.user?.login ?? 'unknown';

  return {
    type: 'html',
    value:
      `<div class="gh-embed gh-embed-issue">` +
      `<a href="${url}" class="gh-embed-issue-link" target="_blank" rel="noopener">` +
      `<div class="gh-embed-issue-header">` +
      icon +
      `<span class="gh-embed-issue-type">${typeLabel}</span>` +
      `<span class="gh-issue-state ${stateClass}">${stateText}</span>` +
      `</div>` +
      `<div class="gh-embed-issue-title">${escapeHtml(data.title)}</div>` +
      `<div class="gh-embed-issue-meta">` +
      `#${data.number} by ${escapeHtml(user)}` +
      (labels ? ` &middot; ${labels}` : '') +
      `</div>` +
      `</a>` +
      `</div>`,
  };
}

export function renderFallbackLink(url, type) {
  return {
    type: 'html',
    value:
      `<div class="gh-embed gh-embed-fallback">` +
      (type === 'pr' ? ICON_PR : type === 'issue' ? ICON_ISSUE : ICON_REPO) +
      `<a href="${url}" target="_blank" rel="noopener">${escapeHtml(url)}</a>` +
      `</div>`,
  };
}
