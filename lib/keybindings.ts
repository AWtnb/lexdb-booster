import type { ActionId, KeyBinding } from "./types";

/**
 * デフォルトのキーバインド定義
 * hotkey-handler.tsに以前ハードコードされていた対応関係をそのまま移植したもの
 */
export const DEFAULT_KEY_BINDINGS: KeyBinding[] = [
  // 全ページ共通
  { key: "A-Enter", actionId: "submitSearch" },
  { key: "A-KeyL", actionId: "submitSearch" },
  { key: "KeyH", actionId: "goHome" },

  // 検索ページ
  { key: "A-KeyC", actionId: "clearAllInputBox" },
  { key: "KeyN", actionId: "pasteCaseNumber" },
  { key: "KeyD", actionId: "pasteDate" },
  { key: "KeyL", actionId: "pasteLexId" },
  { key: "KeyF", actionId: "focusFreeWord" },
  { key: "S-KeyF", actionId: "focusBlankFreeWord" },
  { key: "A-KeyV", actionId: "pasteSmoothCsv" },
  { key: "KeyV", actionId: "pasteKiri" },

  // 検索結果ページ
  { key: "Enter", actionId: "openTopResult" },
  { key: "Space", actionId: "openTopResult" },
  { key: "NumpadEnter", actionId: "openTopResult" },
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).flatMap((n) => [
    { key: `Digit${n}`, actionId: `openResult${n}` as ActionId },
    { key: `Numpad${n}`, actionId: `openResult${n}` as ActionId },
  ]),

  // 詳細ページ
  { key: "KeyC", actionId: "copyCaseNumber" },
  { key: "KeyI", actionId: "copyReference" },
  { key: "C-KeyI", actionId: "copyReferenceId" },
  { key: "S-KeyI", actionId: "copyReferenceTsv" },
  { key: "KeyZ", actionId: "gotoZenbun" },

  // 全文ページ（zキーだが、gotoZenbunとはスコープが違うため別ActionIdが必要）
  { key: "KeyZ", actionId: "gotoSyoshi" },

  // 全文ページ or 詳細ページ
  { key: "KeyR", actionId: "gotoSearchResults" },
];
