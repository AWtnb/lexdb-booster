import { defineContentScript } from "#imports";
import { copyString } from "@/lib/copy";
import { buildKeyString, isEventOnInputableElem } from "@/lib/keystring";
import { getCurrentClipboardText } from "@/lib/text-utils";
import {
  clearInput,
  copyCaseNumber,
  copyReference,
  copyWljpId,
  getDisplayedCaseNumber,
  getDisplayedWljpId,
  goSearchHome,
  pasteAndSearch,
  pasteCaseNumber,
  pasteDateField,
  pasteWljpId,
  pressSubmitButton,
} from "./actions";

/**
 * 判例検索ページでフリーワード検索欄にフォーカスがあたってしまうのを抑制する
 */
const suppressInitialFocus = () => {
  const ft = document.getElementById("ft");
  if (!ft) return;

  const onFocus = () => {
    ft.blur();
    ft.removeEventListener("focus", onFocus);
  };

  ft.addEventListener("focus", onFocus);
};

type WestlawKeyBinding = {
  key: string;
  action: (clipboardText: string) => boolean;
};

const WESTLAW_SEARCH_KEY_BINDINGS: WestlawKeyBinding[] = [
  { key: "KeyD", action: pasteDateField },
  { key: "KeyN", action: pasteCaseNumber },
  { key: "KeyL", action: pasteWljpId },
  { key: "A-Enter", action: pressSubmitButton },
  { key: "A-KeyL", action: pressSubmitButton },
  { key: "A-KeyC", action: clearInput },
  { key: "KeyV", action: pasteAndSearch },
];

const WESTLAW_DETAIL_KEY_BINDINGS: WestlawKeyBinding[] = [
  {
    key: "KeyH",
    action: () => {
      goSearchHome();
      return true;
    },
  },
  { key: "KeyC", action: copyCaseNumber },
  {
    key: "KeyI",
    action: () => {
      const wid = getDisplayedWljpId();
      if (wid) {
        copyString(document, `WestlawJapan ${wid}`);
        return true;
      }
      return false;
    },
  },
  { key: "C-KeyI", action: copyWljpId },
  {
    key: "S-KeyI",
    action: () => {
      const wid = getDisplayedWljpId();
      const cn = getDisplayedCaseNumber();
      if (wid && cn) {
        copyString(document, `WestlawJapan\t${wid}\t${cn}`);
        return true;
      }
      return false;
    },
  },
  { key: "KeyQ", action: copyReference },
];

const handleHotkey = async (pressed: string, bindings: WestlawKeyBinding[]) => {
  for (const binding of bindings) {
    if (binding.key !== pressed) continue;
    const cb = await getCurrentClipboardText();
    binding.action(cb);
  }
};

const setupHotkeys = (bindings: WestlawKeyBinding[]) => {
  document.onkeyup = async (keyEvent) => {
    console.log({ key: keyEvent.key }, { code: keyEvent.code });
    if (isEventOnInputableElem(keyEvent)) return;
    const pressed = buildKeyString(keyEvent);
    await handleHotkey(pressed, bindings);
  };
};

const styleUpDetailPage = () => {
  const parent = document.getElementById("related-info-case-summary");
  if (!parent) return;

  const target = document.getElementById("related-info-case-flash-commentary");
  if (!target) return;

  if (parent.firstElementChild === target) return;

  target.style.background = "LemonChiffon";
  parent.insertBefore(target, parent.firstChild);
};

const observeDetailPane = () => {
  const pane = document.getElementById("docDisplayRightPane");
  if (!pane) return;

  const observer = new MutationObserver(() => {
    styleUpDetailPage();
  });

  observer.observe(pane, { childList: true, subtree: true });
};

export default defineContentScript({
  matches: [
    "https://go.westlawjapan.com/wljp/app/doc*",
    "https://go.westlawjapan.com/wljp/app/search*",
    "https://go.westlawjapan.com/wljp/app/welcome*",
  ],
  main: () => {
    const url = document.location.href;
    if (url.includes("wljp/app/welcome")) {
      document.getElementById("ft")?.focus();
      return;
    }
    if (url.includes("wljp/app/search")) {
      suppressInitialFocus();
      setupHotkeys(WESTLAW_SEARCH_KEY_BINDINGS);
    }
    if (url.includes("wljp/app/doc")) {
      setupHotkeys(WESTLAW_DETAIL_KEY_BINDINGS);
      styleUpDetailPage();
      observeDetailPane();
    }
  },
});
