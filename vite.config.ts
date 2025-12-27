import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },

      plugins: [
        react(),

        // Bundle Analyzer - generates stats.html after build
        visualizer({
          filename: './dist/stats.html',
          open: false, // Set to true to auto-open in browser
          gzipSize: true,
          brotliSize: true,
          template: 'treemap',
        }),
      ],

      build: {
        rollupOptions: {
          output: {
            // Manual chunking for optimized loading
            manualChunks: {
              // React vendors in separate chunk (cacheable)
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],

              // Common UI libraries (used everywhere)
              'ui-common': ['lucide-react', 'react-hot-toast'],

              // Recharts - only used in admin Dashboard (lazy loaded)
              'charts-vendor': ['recharts'],

              // Supabase in separate chunk
              'supabase-vendor': ['@supabase/supabase-js'],
            },
          },
        },

        // Optimization settings
        chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
        sourcemap: false, // Disable sourcemaps in production
        minify: 'esbuild', // Use esbuild (faster than terser)

        // Asset optimization
        assetsInlineLimit: 4096, // Inline assets < 4KB as base64
      },

      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
      },

      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },

      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
