import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig(({ command }) => {
  // ...
  return {
    root: "client",
    // ...
    build: {
      // în loc de "../dist/public"
      outDir: "../dist",
      emptyOutDir: false,
    },
  };
});
;

  return {
    plugins: [
      react(),
      tailwindcss(),
      metaImagesPlugin(),

      // ✅ only in dev (and only on Replit)
      ...(isDev && isReplit ? [runtimeErrorOverlay()] : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },

    root: path.resolve(import.meta.dirname, "client"),

    build: {
      outDir: path.resolve(import.meta.dirname, "dist", "public"),
      emptyOutDir: false, // ✅ don't wipe dist (server bundle goes there)
    },

    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },

    clearScreen: false,
    logLevel: "info",
  };
});
