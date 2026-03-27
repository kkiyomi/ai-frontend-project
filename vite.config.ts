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
        // 🔹 Split mock data by folder + file type
        if (id.includes("mock_data_")) {
          const parts = id.split('/');

          // e.g. "mock_data_Weird Game Awakening a Bug-Level Talent from the Start"
          const folder = parts.find(p => p.startsWith("mock_data_")) || "mock_data_misc";

          // normalize folder to avoid spaces
          const seriesKey = folder.replace(/\s+/g, "_");

          const fileName = parts.at(-1) || "";

          if (fileName.includes("series.")) {
            return `${seriesKey}_series`;
          }

          if (fileName.includes("chapters.")) {
            return `${seriesKey}_chapters`;
          }

          if (fileName.includes("glossary.")) {
            return `${seriesKey}_glossary`;
          }

          return `${seriesKey}_other`;
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
