import { defineContentScript } from "#imports";
import { copyString } from "@/lib/copy";
import { setupHotkeys, type KeyBinding } from "@/lib/hotkey";
import {
  clearInput,
  copyCaseNumber,
  copyLliId,
  copyReference,
  getDisplayedCaseNumber,
  getDisplayedLliId,
  goHome,
  pasteAndSearch,
  pasteCaseNumber,
  pasteDateField,
  pasteLliId,
  pressSubmitButton,
  styleUpSource,
} from "./actions";

const LLIDB_SEARCH_KEY_BINDINGS: KeyBinding[] = [
  { key: "A-KeyL", action: pressSubmitButton },
  { key: "A-Enter", action: pressSubmitButton },
  { key: "A-KeyC", action: clearInput },
  { key: "KeyL", action: pasteLliId },
  { key: "KeyN", action: pasteCaseNumber },
  { key: "KeyD", action: pasteDateField },
  { key: "KeyV", action: pasteAndSearch },
];

const LLIDB_SEARCH_RESULT_KEY_BINDINGS: KeyBinding[] = [
  { key: "KeyH", action: goHome },
];

const LLIDB_DETAIL_KEY_BINDINGS: KeyBinding[] = [
  {
    key: "KeyH",
    action: goHome,
  },
  {
    key: "KeyR",
    action: () => {
      history.back();
      return true;
    },
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
    if (url.includes("search/list")) {
      const results = document.querySelectorAll("a.list_link[data-id]");
      if (results && results.length === 1) {
        (results[0]! as HTMLAnchorElement).focus();
        return;
      }
      setupHotkeys(LLIDB_SEARCH_RESULT_KEY_BINDINGS);
      return;
    }
    styleUpSource();
    setupHotkeys(LLIDB_DETAIL_KEY_BINDINGS);
  },
});
