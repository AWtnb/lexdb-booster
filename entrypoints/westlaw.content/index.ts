import { buildKeyString, isEventOnInputableElem } from "@/lib/keystring";
import { getCurrentClipboardText } from "@/lib/text-utils";
import { defineContentScript } from "wxt/utils/define-content-script";
import {
  goSearchHome,
  pasteAndSearch,
  pasteCaseNumber,
  pasteDateField,
  pasteWljpId,
  pressClearButton,
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
  { key: "A-KeyC", action: pressClearButton },
  { key: "KeyV", action: pasteAndSearch },
];

const WESTLAW_DETAIL_KEY_BINDINGS: WestlawKeyBinding[] = [
  {
    key: "KeyH",
    action: (_) => {
      goSearchHome();
      return true;
    },
  },
  // { key: "KeyC", action:  },
  // { key: "KeyQ", action:  },
  // { key: "KeyI", action:  },
  // { key: "C-KeyI", action:  },
  // { key: "S-KeyI", action:  },
  // { key: "KeyZ", action:  },
  // 検索結果のn件目を開く
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
      suppressInitialFocus();
      setupHotkeys(WESTLAW_DETAIL_KEY_BINDINGS);
    }
  },
});
