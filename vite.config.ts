// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy'; // 追加：ファイルコピー用プラグインをインポート

export default defineConfig({
  base: '/fuchupo/', // GitHub Pagesでのサブパス指定
  plugins: [
    react(), // Reactプラグイン
    viteStaticCopy({ // 追加：news.jsonをdistにコピー
      targets: [
        {
          src: 'public/news.json', // コピー元のファイル
          dest: '.'                // dist/直下にコピーする
        }
      ]
    })
  ]
});
