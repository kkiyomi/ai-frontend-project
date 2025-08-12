import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: ["jmvyct-5173.csb.app"], // Add the host that's being blocked
  },
});
