import { defineContentScript } from "wxt/utils/define-content-script";

const FOCUS_TARGETS = [
  {
    match: "https://www.lawlibrary.jp/Law/ReLoginForm.aspx",
    id: "LinkButton1",
  },
  {
    match: "https://www.lawlibrary.jp/Law/LawLibrary/LawTOP.aspx",
    id: "LexDbHyperLink",
  },
  {
    match: "https://lex.lawlibrary.jp/lexbin/DBSelectLaw.aspx",
    id: "DB1000_LinkButton",
  },
] as const;

export default defineContentScript({
  matches: FOCUS_TARGETS.map(({ match }) => `${match}*`),
  main: () => {
    const url = window.location.href.replace(/\?.*$/, "");
    const targetId = FOCUS_TARGETS.find(({ match }) => match === url)?.id;
    if (!targetId) return;
    document.getElementById(targetId)?.focus();
  },
});
