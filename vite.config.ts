
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Mendapatkan direktori konfigurasi secara kompatibel dengan ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const disableHMR = process.env.DISABLE_HMR === 'true';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    allowedHosts: true,

    // Menonaktifkan HMR ketika berjalan di AI Studio
    hmr: disableHMR ? false : undefined,

    // Mengurangi penggunaan CPU ketika HMR dinonaktifkan
    watch: disableHMR
      ? null
      : {
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
          ],
        },
  },
});
