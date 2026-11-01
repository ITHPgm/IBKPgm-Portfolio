import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pages = [
  'index.html', 'about/index.html', 'work/index.html', 'freelance/index.html',
  'blog/index.html', 'blog/article/index.html', 'resume/index.html',
  'hire/index.html', 'chat/index.html', 'admin/index.html', 'media/index.html', 'privacy/index.html'
];

export default defineConfig({
  appType: 'mpa',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replaceAll('/', '_').replace('.html', ''), resolve(import.meta.dirname, page)]))
    }
  }
});
