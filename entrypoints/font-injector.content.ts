import { defineContentScript } from "#imports";

export default defineContentScript({
  matches: [
    "https://lex.lawlibrary.jp/lexbin/*",
    "https://www.lawlibrary.jp/Law/*",
  ],
  runAt: "document_start",
  main: () => {
    document.documentElement.dataset.fontUrl = browser.runtime.getURL(
      "/fonts/NotoSansJP-Regular.ttf",
    );
  },
});
