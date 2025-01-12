import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

const path = fileURLToPath(import.meta.url);

export default defineConfig({
  root: join(dirname(path), "client"),
  plugins: [vue(), vuetify()],
  ssr: {
    external: ["use-sync-external-store"],
  },
});
