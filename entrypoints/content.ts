import { defineContentScript } from "wxt/utils/define-content-script";

export default defineContentScript({
  matches: [
    "https://lex.lawlibrary.jp/lexbin/DBSelectLaw.aspx",
    "https://lex.lawlibrary.jp/lexbin/LinkSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/SearchAll.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllCheck.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllResult.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowZenbun.aspx*",
    "https://www.lawlibrary.jp/Law/LawLibrary/LawTOP.aspx",
    "https://www.lawlibrary.jp/Law/ReLoginForm.aspx",
  ],
  allFrames: true,
  runAt: "document_idle",
  main: () => {
    const url = new URL(window.location.href);
    if (url.host === "www.lawlibrary.jp") {
      if (url.pathname == "/Law/ReLoginForm.aspx") {
        document.getElementById("LinkButton1")?.focus();
        return;
      }
      if (url.pathname == "/Law/LawLibrary/LawTOP.aspx") {
        document.getElementById("LexDbHyperLink")?.focus();
        return;
      }
    }

    if (url.pathname === "/lexbin/DBSelectLaw.aspx") {
      document.getElementById("DB1000_LinkButton")?.focus();
      return;
    }
  },
});
