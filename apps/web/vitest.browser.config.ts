import path from "node:path";
import { playwright } from "@vitest/browser-playwright";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ["@tanstack/vue-query", "canvas-confetti", "firebase/database"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
      instances: [{ browser: "chromium" }],
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      all: true,
      include: ["src/**/*.{ts,vue}"],
      exclude: [
        "src/tests/**",
        "src/stories/**",
        "src/services/**",
        "vitest.shims.d.ts",
      ],
    },
  },
});
