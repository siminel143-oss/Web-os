import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

// vite.config.ts
export default defineConfig(({ command }) => {
  // ...
  return {
    root: "client",
    // ...
    build: {
      outDir: "dist",
      emptyOutDir: false,
    },
    // ...
  };
});


  return {
    root: "client",
    plugins: [
      react(),
      tailwindcss(),
      metaImagesPlugin(),
      ...(isDev && isReplit ? [runtimeErrorOverlay()] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    build: {
      // ajustează outDir în funcție de ce vrei să expui pe Vercel
      outDir: "../dist",
      emptyOutDir: false,
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      fs: { strict: true, deny: ["**/.*"] },
    },
    clearScreen: false,
    logLevel: "info",
  };
});
