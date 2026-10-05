import { buildKeyString, isEventOnInputableElem } from "./keystring";
import { getCurrentClipboardText } from "./text-utils";

export type KeyBinding = {
  key: string;
  action: (clipboardText: string) => boolean;
};

const handleHotkey = async (pressed: string, bindings: KeyBinding[]) => {
  for (const binding of bindings) {
    if (binding.key !== pressed) continue;
    const cb = await getCurrentClipboardText();
    binding.action(cb);
  }
};

export const setupHotkeys = (bindings: KeyBinding[]) => {
  document.onkeyup = async (keyEvent) => {
    if (isEventOnInputableElem(keyEvent)) return;
    const pressed = buildKeyString(keyEvent);
    await handleHotkey(pressed, bindings);
  };
};
