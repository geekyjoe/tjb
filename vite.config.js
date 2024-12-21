import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core and routing
          "vendor": ["react", "react-dom", "react-router-dom"],

          // UI Framework components
          "ui-components": [
            "@radix-ui/react-separator",
            "antd",
            "@ant-design/icons",
          ],
          // Icons and visual elements
          icons: ["lucide-react", "react-icons/md"],
        },
      },
    },
  },
});
