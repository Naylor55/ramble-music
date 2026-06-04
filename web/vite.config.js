import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',      // ← 加这一行
  server: {
    port: 5173,
    proxy: {
      '/netease': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/netease/, ''),
      },
    },
  },
})