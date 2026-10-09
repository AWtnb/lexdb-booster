import { setupHotkeys, type KeyBinding } from "@/lib/hotkey";

import { defineContentScript } from "#imports";
import {
  closeAlertMessage,
  pasteCaseNumber,
  pressClearButton,
  pressSubmitButton,
} from "./actions";
import { setupDetailPage } from "./detail-page";

const D1LAW_SEARCH_KEY_BINDINGS: KeyBinding[] = [
  { key: "Escape", action: closeAlertMessage },
  { key: "A-KeyC", action: pressClearButton },
  { key: "A-KeyL", action: pressSubmitButton },
  { key: "A-Enter", action: pressSubmitButton },
  { key: "KeyN", action: pasteCaseNumber },
];

const setupObserver = () => {
  const target = document.getElementById("hanSearchResult");
  if (!target) return;
  const observer = new MutationObserver(() => {
    const cards = document.querySelectorAll(".dh-card__main");
    if (!cards || cards.length !== 1) return;
    const [card] = cards;
    if (!card) return;
    const link = card.querySelector(
      ".dh-card-menu-detail-link",
    ) as HTMLAnchorElement;
    if (link) {
      link.click();
    }
  });

  observer.observe(target, {
    childList: true,
    subtree: true,
  });
};

export default defineContentScript({
  matches: [
    "https://han-dh.d1-law.com/d1han/search/disp",
    "https://han-dh.d1-law.com/d1han/detail/disp",
    "https://han2-dh.d1-law.com/d1han/search/disp",
    "https://han2-dh.d1-law.com/d1han/detail/disp",
  ],
  main: () => {
    const url = document.location.href;
    if (url.endsWith("search/disp")) {
      setupObserver();
      setupHotkeys(D1LAW_SEARCH_KEY_BINDINGS);
      return;
    }
    setupDetailPage();
  },
});
