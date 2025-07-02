import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pagesでホストする場合は、リポジトリ名を指定
  // 例: https://username.github.io/repository-name/
  base: process.env.NODE_ENV === 'production' ? '/SubaruGame2025/' : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});