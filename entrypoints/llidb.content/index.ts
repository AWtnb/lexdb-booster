import { defineContentScript } from "#imports";
import { copyString } from "@/lib/copy";
import { setupHotkeys, type KeyBinding } from "@/lib/hotkey";
import {
  copyCaseNumber,
  copyLliId,
  copyReference,
  getDisplayedCaseNumber,
  getDisplayedLliId,
  goHome,
  pasteCaseNumber,
  pasteLliId,
  pressClearButton,
  pressSubmitButton,
} from "./actions";

const LLIDB_SEARCH_KEY_BINDINGS: KeyBinding[] = [
  { key: "A-KeyL", action: pressSubmitButton },
  { key: "A-Enter", action: pressSubmitButton },
  { key: "A-KeyC", action: pressClearButton },
  { key: "KeyL", action: pasteLliId },
  { key: "KeyN", action: pasteCaseNumber },
];

const LLIDB_SEARCH_RESULT_KEY_BINDINGS: KeyBinding[] = [
  { key: "KeyH", action: goHome },
];

const LLIDB_DETAIL_KEY_BINDINGS: KeyBinding[] = [
  {
    key: "KeyH",
    action: goHome,
  },
  { key: "KeyC", action: copyCaseNumber },
  {
    key: "KeyI",
    action: () => {
      const lid = getDisplayedLliId();
      if (lid) {
        copyString(document, `LLI/DB ${lid}`);
        return true;
      }
      return false;
    },
  },
  { key: "C-KeyI", action: copyLliId },
  {
    key: "S-KeyI",
    action: () => {
      const lid = getDisplayedLliId();
      const cn = getDisplayedCaseNumber();
      if (lid && cn) {
        copyString(document, `LLI/DB\t${lid}\t${cn}`);
        return true;
      }
      return false;
    },
  },
  { key: "KeyQ", action: copyReference },
];

export default defineContentScript({
  matches: [
    "https://www.legal-info.com/net/search",
    "https://www.legal-info.com/net/search/list",
    "https://www.legal-info.com/net/detail?*",
    "https://www.legal-info.com/detail/get_file?*",
  ],
  allFrames: true,
  main: () => {
    const url = document.location.href;
    if (url.endsWith("search")) {
      setupHotkeys(LLIDB_SEARCH_KEY_BINDINGS);
      return;
    }
    if (url.endsWith("search/list")) {
      setupHotkeys(LLIDB_SEARCH_RESULT_KEY_BINDINGS);
      return;
    }

    setupHotkeys(LLIDB_DETAIL_KEY_BINDINGS);
  },
});
