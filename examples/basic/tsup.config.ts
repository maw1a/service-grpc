import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["clients.ts"], // your main entry
  format: ["esm", "cjs"], // build both ESM and CommonJS
  dts: true, // generate types
  sourcemap: true,
  clean: true, // clear dist on each build
  outDir: "dist",
  target: "node18", // good for Node 18+ and Bun
  minify: false,
});
