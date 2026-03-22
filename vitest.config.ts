import { resolve } from "node:path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const TIMEOUT = 30_000;

export default defineConfig({
  root: "./test",
  test: {
    clearMocks: true,
    testTimeout: TIMEOUT,
    hookTimeout: TIMEOUT,
    teardownTimeout: TIMEOUT,
    passWithNoTests: true,
    setupFiles: "./vitest-e2e.setup.ts",
  },
  resolve: {
    alias: {
      src: resolve(__dirname, "./src"),
      test: resolve(__dirname, "./test"),
    },
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
});
