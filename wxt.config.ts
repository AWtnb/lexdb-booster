import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "better-lexdb",
    description: "LEX/DBをもっと使いやすく",
    permissions: ["clipboardRead", "clipboardWrite", "storage"],
    host_permissions: [
      "https://lex.lawlibrary.jp/*",
      "https://www.lawlibrary.jp/*",
    ],
  },
});
