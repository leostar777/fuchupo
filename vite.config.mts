// vite.config.mts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: '/fuchupo/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'public/news.json', dest: '.' }   // dist直下にコピー
      ]
    })
  ]
});
