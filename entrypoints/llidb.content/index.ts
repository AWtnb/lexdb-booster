import { defineContentScript } from "#imports";
import { setupHotkeys, type KeyBinding } from "@/lib/hotkey";
import { goHome } from "./actions";

const LLIDB_SEARCH_KEY_BINDINGS: KeyBinding[] = [];

const LLIDB_SEARCH_RESULT_KEY_BINDINGS: KeyBinding[] = [];

const LLIDB_DETAIL_KEY_BINDINGS: KeyBinding[] = [
  { key: "KeyH", action: goHome },
];

export default defineContentScript({
  matches: [
    "https://www.legal-info.com/net/search",
    "https://www.legal-info.com/net/search/list",
    "https://www.legal-info.com/net/detail?*",
  ],
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
