import { isEventOnInputableElem } from "@/lib/hotkey/hotkey-setup";
import { buildKeyString } from "@/lib/hotkey/keystring";
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
  matches: ["https://go.westlawjapan.com/wljp/app/search/template*"],
  main: () => {
    document.onkeyup = async (keyEvent) => {
      console.log({ key: keyEvent.key }, { code: keyEvent.code });
      if (isEventOnInputableElem(keyEvent)) return;
      const pressed = buildKeyString(keyEvent);
      await handleHotkey(pressed);
    };
  },
});
