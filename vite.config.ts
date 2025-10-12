import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    allowedHosts: ["fjkvlz-5173.csb.app"],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 🔹 Automatically bundle all mock data files into a single "mock" chunk
          if (id.includes("mock_data_")) {
            return "mock";
          }

          // 🔹 Optionally group vendor deps into a vendor chunk (good for cache efficiency)
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
