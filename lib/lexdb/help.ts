import { formatKeyString } from "../keystring";
import type { PageScope } from "./actions/registry";
import { ACTION_REGISTRY } from "./actions/registry";
import { DEFAULT_KEY_BINDINGS } from "./hotkey/keybindings";
import {
  isDetailPage,
  isSearchPage,
  isSearchResultPage,
  isZenbunPage,
} from "./page";

/**
 * URL から現在ページが該当するスコープ一覧を返す
 */
const getActiveScopes = (url: URL): Set<PageScope> => {
  const scopes = new Set<PageScope>(["any"]);
  if (isSearchPage(url)) {
    scopes.add("search");
  } else {
    scopes.add("notSearch");
  }
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
    return [{ key: formatKeyString(key), label: entry.label }];
  });
};

const HELP_OVERLAY_ID = "extension-help-overlay";

/**
 * 現在ページのキーバインド一覧オーバーレイを左下に表示/非表示トグル
 */
export const toggleHelpOverlay = (
  doc: Document,
  bindings: { key: string; label: string }[],
): void => {
  const existing = doc.getElementById(HELP_OVERLAY_ID);
  if (existing !== null) {
    existing.remove();
    return;
  }

  const overlay = doc.createElement("div");
  overlay.id = HELP_OVERLAY_ID;
  overlay.style.cssText = [
    "position:fixed",
    "bottom:20px",
    "left:20px",
    "background:rgba(0,0,0,0.75)",
    "color:white",
    "padding:12px 16px",
    "border-radius:8px",
    "z-index:9999",
    "font-size:13px",
    "line-height:1.8",
    "pointer-events:none",
    "max-height:80vh",
    "overflow-y:auto",
  ].join(";");

  const title = doc.createElement("div");
  title.style.cssText = [
    "font-weight:bold",
    "margin-bottom:6px",
    "font-size:14px",
    "border-bottom:1px solid rgba(255,255,255,0.4)",
    "padding-bottom:4px",
    "display:flex",
    "align-items:center",
    "gap:8px",
  ].join(";");

  const titleText = doc.createElement("span");
  titleText.textContent = "⌨ キーボードショートカット";

  const toggleHint = doc.createElement("span");
  toggleHint.style.cssText = [
    "font-size:11px",
    "font-weight:normal",
    "opacity:0.7",
    "display:flex",
    "align-items:center",
    "gap:4px",
  ].join(";");

  const hintLabel = doc.createElement("span");
  hintLabel.textContent = "表示切替:";

  const hintBadge = doc.createElement("span");
  hintBadge.textContent = "?";
  hintBadge.style.cssText = [
    "font-family:monospace",
    "background:rgba(255,255,255,0.15)",
    "padding:1px 6px",
    "border-radius:4px",
    "display:inline-block",
    "text-align:center",
  ].join(";");

  toggleHint.appendChild(hintLabel);
  toggleHint.appendChild(hintBadge);
  title.appendChild(titleText);
  title.appendChild(toggleHint);
  overlay.appendChild(title);

  for (const { key, label } of bindings) {
    const row = doc.createElement("div");
    row.style.cssText =
      "display:flex;gap:12px;align-items:baseline;margin:8px 0;";

    const keyBadge = doc.createElement("span");
    keyBadge.textContent = key;
    keyBadge.style.cssText = [
      "font-family:monospace",
      "background:rgba(255,255,255,0.15)",
      "padding:1px 6px",
      "border-radius:4px",
      "min-width:80px",
      "display:inline-block",
      "text-align:center",
      "flex-shrink:0",
    ].join(";");

    const labelEl = doc.createElement("span");
    labelEl.textContent = label;

    row.appendChild(keyBadge);
    row.appendChild(labelEl);
    overlay.appendChild(row);
  }

  doc.body.appendChild(overlay);
};
