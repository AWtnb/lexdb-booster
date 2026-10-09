import { copyString } from "@/lib/copy";
import { setupHotkeys, type KeyBinding } from "@/lib/hotkey";
import {
  copyCaseNumber,
  copyD1LawId,
  copyReference,
  getDisplayedCaseNumber,
  getDisplayedD1LawId,
} from "./actions";

const D1LAW_DETAIL_KEY_BINDINGS: KeyBinding[] = [
  {
    key: "KeyH",
    action: () => {
      window.close();
      return true;
    },
  },
  {
    key: "KeyC",
    action: copyCaseNumber,
  },
  {
    key: "KeyI",
    action: () => {
      const did = getDisplayedD1LawId();
      if (did) {
        copyString(document, `D1-Law ${did}`);
        return true;
      }
      return false;
    },
  },
  {
    key: "C-KeyI",
    action: copyD1LawId,
  },
  {
    key: "S-KeyI",
    action: () => {
      const did = getDisplayedD1LawId();
      const cn = getDisplayedCaseNumber();
      if (did && cn) {
        copyString(document, `D1-Law\t${did}\t${cn}`);
        return true;
      }
      return false;
    },
  },
  { key: "KeyQ", action: copyReference },
];

const openBiblioTab = (): boolean => {
  const biblioTab = document.getElementById("biblioInfo");
  if (!biblioTab) return false;
  biblioTab.click();
  return true;
};

export const setupDetailPage = () => {
  const target = document.getElementById("detailForm");
  if (!target) return;

  const observer = new MutationObserver((_, obs) => {
    setupHotkeys(D1LAW_DETAIL_KEY_BINDINGS);
    if (!openBiblioTab()) return;
    obs.disconnect();
  });

  observer.observe(target, {
    childList: true,
    subtree: true,
  });
};
