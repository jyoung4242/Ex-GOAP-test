import topLevelAwait from "vite-plugin-top-level-await";

export default {
  plugins: [
    topLevelAwait({
      promiseExportName: "__tla",
      promiseImportName: "default",
    }),
  ],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
};
