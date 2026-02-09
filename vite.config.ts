/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/NewRelic-Query-Builder/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@xero/xui/react": "@xero/xui/react-es6",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "e2e/**",
      "playwright-report/**",
      "test-results/**",
      "node_modules/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/test/**",
      ],
    },
  },
}));
