import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "lexdb-booster",
    description: "LEX/DBをもっと使いやすく",
    permissions: ["clipboardRead", "clipboardWrite"],
    host_permissions: [
      "https://lex.lawlibrary.jp/*",
      "https://www.lawlibrary.jp/*",
    ],
    web_accessible_resources: [
      {
        resources: ["fonts/*"],
        matches: ["https://lex.lawlibrary.jp/*", "https://www.lawlibrary.jp/*"],
      },
    ],
  },
});
