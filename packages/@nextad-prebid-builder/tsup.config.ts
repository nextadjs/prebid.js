import { defineConfig } from "tsup";

export default defineConfig([
  {
    format: ["esm"],
    minify: true,
    clean: true,
    entry: ["src/index.ts"],
  },
]);
