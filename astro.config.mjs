import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGitHubEmbed from './src/plugins/remark-github-embed.mjs';
import { visit } from 'unist-util-visit';

function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid' && parent && index != null) {
        parent.children[index] = {
          type: 'html',
          value: `<pre class="mermaid">${node.value}</pre>`,
        };
      }
    });
  };
}

export default defineConfig({
  site: 'https://diohabara.github.io',
  image: {
    service: passthroughImageService(),
  },
  integrations: [sitemap(), mdx()],
  markdown: {
    shikiConfig: {
      theme: 'monokai',
    },
    remarkPlugins: [remarkMermaid, remarkGitHubEmbed, remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'append' }],
    ],
  },
  redirects: {
    '/index.xml': '/rss.xml',
  },
});
