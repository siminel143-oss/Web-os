import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import { metaImagesPlugin } from './vite-plugin-meta-images';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const isReplit = process.env.REPL_ID !== undefined;

  return {
    root: 'client',
    plugins: [
      react(),
      tailwindcss(),
      metaImagesPlugin(),
      ...(isDev && isReplit ? [runtimeErrorOverlay()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client', 'src'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
      },
    },
    build: {
      // pentru Vercel: generează output în client/dist
      outDir: 'dist',
      emptyOutDir: false,
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      fs: { strict: true, deny: ['**/.*'] },
    },
    clearScreen: false,
    logLevel: 'info',
  };
});
