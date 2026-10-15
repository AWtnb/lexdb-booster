import { defineContentScript } from "#imports";
import { setupHotkeys, type KeyBinding } from "@/lib/hotkey";
import { goSearchHome, styleUp } from "./result-page";
import {
  pasteDateField,
  pressCommitButton,
  pressResetButton,
  syncDateInput,
} from "./search-page";

const SEARCH_PAGE_KEYBINDINGS: KeyBinding[] = [
  { key: "KeyD", action: pasteDateField },
  { key: "A-KeyL", action: pressCommitButton },
  { key: "A-Enter", action: pressCommitButton },
  { key: "A-KeyC", action: pressResetButton },
];
const RESULT_PAGE_KEYBINDINGS: KeyBinding[] = [
  { key: "KeyH", action: goSearchHome },
];

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
      setupHotkeys(SEARCH_PAGE_KEYBINDINGS);
      return;
    }
    setupHotkeys(RESULT_PAGE_KEYBINDINGS);
    styleUp();
  },
});
