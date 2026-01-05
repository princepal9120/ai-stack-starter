// website/astro.config.mts
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import node from '@astrojs/node';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
  site: 'https://ai-stack.dev',
  adapter: node({
    mode: 'standalone',
  }),
  output: 'static', // Default to static, opt-in to server with prerender=false
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    mdx(),
    sitemap(),
    icon(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    rehypePlugins: [
      rehypeSlug, // Automatically add IDs to headings
      [rehypeAutolinkHeadings, { behavior: 'wrap' }], // Make headings linkable
    ],
  },
});
