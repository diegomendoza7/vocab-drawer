import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_PORT = process.env.API_PORT || 8787;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        /* Split the parts that change on different clocks.
         *
         * The vocabulary is ~300 KB of static data that changes when words are
         * curated, and the vendor code changes when dependencies are bumped —
         * neither moves when a screen is edited. In one chunk, every code edit
         * invalidated all of it for returning visitors.
         *
         * This does not reduce first-paint bytes. Doing that means loading the
         * C1 sets on demand, which `src/data/vocab.js` cannot do while it
         * builds DATA eagerly at module scope, and lazy-loading whole areas
         * needs component boundaries that a single 5,900-line screen component
         * does not have. Both are follow-ups, not one-liners. */
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
          if (id.includes("/src/data/")) return "vocabulary";
          return undefined;
        },
      },
    },
  },
  server: {
    // 5173 is taken by the trade-validator dev server.
    port: 5174,
    strictPort: true,
    // Everything under /api goes to the local proxy, which holds the
    // Anthropic key. Nothing in the browser bundle ever sees it.
    proxy: {
      "/api": {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
