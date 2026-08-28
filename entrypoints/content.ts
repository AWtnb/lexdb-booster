import { defineContentScript } from "wxt/utils/define-content-script";

export default defineContentScript({
  matches: [
    "https://lex.lawlibrary.jp/lexbin/SearchAll.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllCheck.aspx",
    "https://lex.lawlibrary.jp/lexbin/ShowSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/LinkSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/SearchAllResult.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowZenbun.aspx*",
    "https://www.lawlibrary.jp/Law/ReLoginForm.aspx",
    "https://www.lawlibrary.jp/Law/LawLibrary/LawTOP.aspx",
    "https://lex.lawlibrary.jp/lexbin/DBSelectLaw.aspx",
  ],
  allFrames: true,
  runAt: "document_idle",
  main: () => {
    // 初期化処理
  },
});
