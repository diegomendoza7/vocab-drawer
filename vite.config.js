import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_PORT = process.env.API_PORT || 8787;

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
