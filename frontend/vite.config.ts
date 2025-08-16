import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库分块
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'tailwindcss'],
          'vendor-math': ['katex', 'react-katex'],
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-utils': ['axios', 'html2canvas', 'mammoth', 'prismjs'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-state': ['zustand', '@tanstack/react-query']
        }
      }
    },
    // 调整分块大小警告限制
    chunkSizeWarningLimit: 1000,
    // 确保字体文件被正确复制
    copyPublicDir: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
}))
