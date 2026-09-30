import { initializeScript } from "@/lib/lexdb/hotkey/hotkey-setup";
import { defineContentScript } from "wxt/utils/define-content-script";

export default defineContentScript({
  matches: [
    "https://lex.lawlibrary.jp/lexbin/LinkSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/LinkZenbun.aspx*",
    "https://lex.lawlibrary.jp/lexbin/SearchAll.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllCheck.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllResult.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowZenbun.aspx*",
  ],
  world: "MAIN",
  runAt: "document_idle",
  main: () => {
    window.addEventListener("load", initializeScript);
  },
});
