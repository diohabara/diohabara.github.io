// URL patterns for GitHub embeds

const GIST_RE =
  /^https:\/\/gist\.github\.com\/(?<owner>[^/]+)\/(?<id>[a-f0-9]+)(?:#file-(?<file>.+))?$/;

const BLOB_RE =
  /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/blob\/(?<ref>[^/]+)\/(?<path>.+)$/;

const ISSUE_RE =
  /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/issues\/(?<number>\d+)$/;

const PR_RE =
  /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/pull\/(?<number>\d+)$/;

/**
 * Classify a URL into a GitHub embed type.
 * @param {string} url
 * @returns {{ type: 'gist'|'blob'|'issue'|'pr', params: Record<string,string> } | null}
 */
export function classifyUrl(url) {
  let m;

  m = url.match(GIST_RE);
  if (m) return { type: 'gist', params: m.groups };

  m = url.match(BLOB_RE);
  if (m) return { type: 'blob', params: m.groups };

  m = url.match(ISSUE_RE);
  if (m) return { type: 'issue', params: m.groups };

  m = url.match(PR_RE);
  if (m) return { type: 'pr', params: m.groups };

  return null;
}
