// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import remarkRichEmbed from './src/plugins/remark-rich-embed';

export default defineConfig({
  site: 'https://walker.blog',
  integrations: [
    mdx(),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkRichEmbed],
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
