import { storage } from "wxt/utils/storage";
import { DEFAULT_KEY_BINDINGS } from "./keybindings";
import type { KeyBinding } from "./types";

/**
 * ユーザーが設定したキーバインド一覧
 * 複数端末でChromeにログインしている場合は同期される（sync:プレフィックス）
 * 未設定時はデフォルト値にフォールバックする
 */
export const keyBindingsStorage = storage.defineItem<KeyBinding[]>(
  "sync:keyBindings",
  {
    fallback: DEFAULT_KEY_BINDINGS,
  },
);
