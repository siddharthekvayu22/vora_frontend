import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000, // 5 MB
    rollupOptions: {
      onwarn(warning, warn) {
        // Show all warnings
        warn(warning);
      },
    },
    // Fail build on errors
    minify: "esbuild",
    sourcemap: false,
  },
  esbuild: {
    // Log all errors and warnings
    logLevel: "error",
    logLimit: 0,
  },
  server: {
    host: true, // or use '0.0.0.0' to expose on all network interfaces
    port: 5173,
  },
});
