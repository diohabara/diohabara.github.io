import { visit } from 'unist-util-visit';
import { classifyUrl } from './github-embed/patterns.mjs';
import { fetchBlob, fetchIssue } from './github-embed/fetchers.mjs';
import {
  renderGistEmbed,
  renderBlob,
  renderIssueCard,
  renderFallbackLink,
} from './github-embed/renderers.mjs';

export default function remarkGitHubEmbed() {
  const token = process.env.GITHUB_TOKEN;

  return async (tree) => {
    const targets = [];

    visit(tree, 'paragraph', (node, index, parent) => {
      if (
        node.children.length === 1 &&
        node.children[0].type === 'link'
      ) {
        const linkNode = node.children[0];
        // Only match bare URLs (autolinks), not labeled links like [text](url)
        const linkText =
          linkNode.children.length === 1 &&
          linkNode.children[0].type === 'text'
            ? linkNode.children[0].value
            : '';
        if (linkText !== linkNode.url) return;

        const classified = classifyUrl(linkNode.url);
        if (classified) {
          targets.push({ node, index, parent, ...classified });
        }
      }
    });

    if (targets.length === 0) return;

    // Gist embeds don't need API calls — replace them synchronously first
    const apiTargets = [];
    for (const target of targets) {
      if (target.type === 'gist') {
        const url = target.node.children[0].url;
        const { index, parent } = target;
        parent.children[index] = renderGistEmbed(url);
      } else {
        apiTargets.push(target);
      }
    }

    if (apiTargets.length === 0) return;

    const results = await Promise.all(
      apiTargets.map(async (target) => {
        try {
          const { type, params } = target;
          let data;
          switch (type) {
            case 'blob':
              data = await fetchBlob(params, token);
              break;
            case 'issue':
            case 'pr':
              data = await fetchIssue(params, token);
              break;
          }
          return { target, data };
        } catch (err) {
          console.warn(
            `[remark-github-embed] Failed to fetch ${target.type}: ${err.message}`,
          );
          return { target, data: null };
        }
      }),
    );

    // Replace in reverse order to preserve indices
    for (const { target, data } of results.reverse()) {
      const { index, parent, type, params } = target;
      const url = target.node.children[0].url;

      if (data) {
        let replacement;
        switch (type) {
          case 'blob':
            replacement = renderBlob(data, url, params);
            break;
          case 'issue':
          case 'pr':
            replacement = renderIssueCard(data, url, type);
            break;
        }
        if (Array.isArray(replacement)) {
          parent.children.splice(index, 1, ...replacement);
        } else {
          parent.children[index] = replacement;
        }
      } else {
        parent.children[index] = renderFallbackLink(url, type);
      }
    }
  };
}
