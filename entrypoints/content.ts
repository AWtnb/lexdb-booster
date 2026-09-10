import { defineContentScript } from "wxt/utils/define-content-script";
import { initializeScript } from "@/lib/hotkey-setup";

/**
 * ログインや遷移確認だけの単純な画面では、
 * ホットキー機構を使わずボタンにフォーカスするだけでよい
 */
const SIMPLE_FOCUS_TARGETS: Record<string, string> = {
  "https://www.lawlibrary.jp/Law/ReLoginForm.aspx": "LinkButton1",
  "https://www.lawlibrary.jp/Law/LawLibrary/LawTOP.aspx": "LexDbHyperLink",
  "https://lex.lawlibrary.jp/lexbin/DBSelectLaw.aspx": "DB1000_LinkButton",
};

export default defineContentScript({
  matches: [
    "https://lex.lawlibrary.jp/lexbin/DBSelectLaw.aspx",
    "https://lex.lawlibrary.jp/lexbin/LinkSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/LinkZenbun.aspx*",
    "https://lex.lawlibrary.jp/lexbin/SearchAll.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllCheck.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllResult.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowZenbun.aspx*",
    "https://www.lawlibrary.jp/Law/LawLibrary/LawTOP.aspx",
    "https://www.lawlibrary.jp/Law/ReLoginForm.aspx*",
  ],
  world: "MAIN",
  runAt: "document_idle",
  main: () => {
    const targetId =
      SIMPLE_FOCUS_TARGETS[window.location.href.replace(/\?.*$/, "")];
    if (targetId) {
      document.getElementById(targetId)?.focus();
      return;
    }

    window.addEventListener("load", () => {
      initializeScript();
    });
  },
});
