import { defineContentScript } from "#imports";
import { syncDateInput } from "./search-page";

export default defineContentScript({
  matches: [
    "https://www.kfs.go.jp/cgi-bin/sysrch/prj/web",
    "https://www.kfs.go.jp/cgi-bin/sysrch/prj/web/pub/editCriteriaByKeyword",
    "https://www.kfs.go.jp/cgi-bin/sysrch/prj/web/pub/listSaiketsuyoushi*",
  ],
  main: () => {
    const url = document.location.href;
    if (url.endsWith("web")) {
      const el = document.querySelector(
        "#keywordBt a",
      ) as HTMLAnchorElement | null;
      if (el) {
        el.focus();
      }
      return;
    }
    if (url.endsWith("editCriteriaByKeyword")) {
      syncDateInput();
      return;
    }
  },
});
