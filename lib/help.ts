import { ACTION_REGISTRY } from "./actions/registry";
import { DEFAULT_KEY_BINDINGS } from "./hotkey/keybindings";
import {
  isDetailPage,
  isSearchResultPage,
  isSearchPage,
  isZenbunPage,
} from "./page";
import type { PageScope } from "./actions/registry";
import { formatKeyString } from "./hotkey/keystring";

/**
 * URL から現在ページが該当するスコープ一覧を返す
 */
const getActiveScopes = (url: URL): Set<PageScope> => {
  const scopes = new Set<PageScope>(["any"]);
  if (isSearchPage(url)) scopes.add("search");
  if (isSearchResultPage(url)) scopes.add("searchResult");
  if (isDetailPage(url)) {
    scopes.add("detail");
    scopes.add("detailOrZenbun");
  }
  if (isZenbunPage(url)) {
    scopes.add("zenbun");
    scopes.add("detailOrZenbun");
  }
  return scopes;
};

/**
 * 現在ページで有効なキーバインドを { key, label } の形で返す
 */
export const getActiveBindings = (
  url: URL,
): { key: string; label: string }[] => {
  const activeScopes = getActiveScopes(url);

  return DEFAULT_KEY_BINDINGS.flatMap(({ key, actionId }) => {
    const entry = ACTION_REGISTRY[actionId];
    if (!entry) return [];
    if (!activeScopes.has(entry.scope)) return [];
    if (key.startsWith("Numpad")) return [];
    if (key.endsWith("V")) return [];
    return [{ key: formatKeyString(key), label: entry.label }];
  });
};
