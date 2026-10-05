import { defineContentScript } from "#imports";
import { setupHotkeys, type KeyBinding } from "@/lib/hotkey";

const D1LAW_SEARCH_KEY_BINDINGS: KeyBinding[] = [];

const D1LAW_DETAIL_KEY_BINDINGS: KeyBinding[] = [];

export default defineContentScript({
  matches: [
    "https://han-dh.d1-law.com/d1han/search/disp",
    "https://han-dh.d1-law.com/d1han/detail/disp",
    "https://han2-dh.d1-law.com/d1han/search/disp",
    "https://han2-dh.d1-law.com/d1han/detail/disp",
  ],
  world: "MAIN",
  main: () => {
    const url = document.location.href;
    if (url.endsWith("search/disp")) {
      setupHotkeys(D1LAW_SEARCH_KEY_BINDINGS);
      return;
    }
    setupHotkeys(D1LAW_DETAIL_KEY_BINDINGS);
  },
});
