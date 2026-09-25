import type { ActionEntry } from "../actions/registry";
import { ACTION_REGISTRY } from "../actions/registry";
import {
  isDetailPage,
  isSearchPage,
  isSearchResultPage,
  isZenbunPage,
} from "../page";
import { getCurrentClipboardText } from "../text-utils";
import type { HotkeyContext, KeyBinding } from "../types";
import { DEFAULT_KEY_BINDINGS } from "./keybindings";

/**
 * Alt修飾キーを含むキーバインドかどうか
 */
const hasAltModifier = (key: string): boolean => key.startsWith("A-");

/**
 * スコープ・isInputableElemを照合して発火可否を返す
 */
const isScopeMatch = (
  entry: ActionEntry,
  binding: KeyBinding,
  url: URL,
  isInputableElem: boolean,
): boolean => {
  if (isInputableElem && !hasAltModifier(binding.key)) return false;

  if (entry.scope === "any") return true;
  if (entry.scope === "search") return isSearchPage(url);
  if (entry.scope === "searchResult") return isSearchResultPage(url);
  if (entry.scope === "detail") return isDetailPage(url);
  if (entry.scope === "zenbun") return isZenbunPage(url);
  if (entry.scope === "detailOrZenbun")
    return isDetailPage(url) || isZenbunPage(url);
  return false;
};

/**
 * ホットキー実行メイン関数
 * KeyBinding[]を順に評価し、最初にマッチしたアクションを実行する
 */
export const handleHotkey = async (
  pressed: string,
  ctx: HotkeyContext,
): Promise<void> => {
  const { url, isInputableElem } = ctx;
  for (const binding of DEFAULT_KEY_BINDINGS) {
    if (binding.key !== pressed) continue;

    const entry = ACTION_REGISTRY[binding.actionId];
    if (!entry) continue;

    if (!isScopeMatch(entry, binding, url, isInputableElem)) continue;

    const cb = entry.needsClipboard ? await getCurrentClipboardText() : "";
    await entry.run(ctx, cb);
    return;
  }
};
