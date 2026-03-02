import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 'ui-vendor': ['@headlessui/vue', '@heroicons/vue'],
          'markdown-vendor': ['marked'],

          // Feature-based chunks
          'chat-features': [
            './src/stores/chat.js',
          ],
          'task-features': [
            './src/stores/tasks.js',
            './src/components/TaskCard.vue'
          ]
        },
        // Better chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId && facadeModuleId.includes('ComponentTest')) {
            return 'assets/dev-only/[name]-[hash].js' // Separate dev components
          }
          return 'assets/[name]-[hash].js'
        }
      }
    },
    // Production optimizations
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets
    cssCodeSplit: true,
    sourcemap: false // Disable for production
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
      }
    },
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@headlessui/vue', '@heroicons/vue'],
    exclude: ['@vite/client', '@vite/env']
  }
})
