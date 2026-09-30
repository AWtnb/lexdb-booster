import { buildKeyString } from "@/lib/keystring";
import { isEventOnInputableElem } from "@/lib/lexdb/hotkey/hotkey-setup";
import { getCurrentClipboardText } from "@/lib/text-utils";
import { defineContentScript } from "wxt/utils/define-content-script";
import { pasteDateField } from "./actions";

const WESTLAW_KEY_BINDINGS: {
  key: string;
  action: (clipboardText: string) => boolean;
}[] = [{ key: "KeyV", action: pasteDateField }];

const handleHotkey = async (pressed: string) => {
  for (const binding of WESTLAW_KEY_BINDINGS) {
    if (binding.key !== pressed) continue;
    const cb = await getCurrentClipboardText();
    binding.action(cb);
  }
};

export default defineContentScript({
  matches: [
    "https://go.westlawjapan.com/wljp/app/search/template*",
    "https://go.westlawjapan.com/wljp/app/welcome*",
  ],
  main: () => {
    if (document.location.href.includes("wljp/app/welcome")) {
      document.getElementById("ft")?.focus();
      return;
    }
    document.getElementById("ft")?.blur();

    document.onkeyup = async (keyEvent) => {
      console.log({ key: keyEvent.key }, { code: keyEvent.code });
      if (isEventOnInputableElem(keyEvent)) return;
      const pressed = buildKeyString(keyEvent);
      await handleHotkey(pressed);
    };
  },
});
