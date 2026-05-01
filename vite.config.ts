import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: 'dist-react',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/ui/content/index.html'),
        tabbar: resolve(__dirname, 'src/ui/tabbar/index.html'),
      },
    },
  },
  server: {
    port: 5123,
    strictPort: true,
  },
})
