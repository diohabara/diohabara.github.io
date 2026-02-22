// GitHub API fetch functions with caching

const cache = new Map();

async function githubFetch(apiUrl, token) {
  if (cache.has(apiUrl)) return cache.get(apiUrl);

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'astro-blog-build',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(apiUrl, {
    headers,
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${apiUrl}`);
  }

  const data = await res.json();
  cache.set(apiUrl, data);
  return data;
}

export async function fetchBlob({ owner, repo, ref, path }, token) {
  const data = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
    token,
  );

  // Files > 1MB don't include content; fetch raw instead
  if (!data.content && data.download_url) {
    const res = await fetch(data.download_url, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Failed to fetch raw file: ${res.status}`);
    data.decoded_content = await res.text();
  } else if (data.content) {
    data.decoded_content = Buffer.from(data.content, 'base64').toString(
      'utf-8',
    );
  }

  return data;
}

export async function fetchIssue({ owner, repo, number }, token) {
  return githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${number}`,
    token,
  );
}
