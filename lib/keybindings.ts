import type { KeyBinding } from "./types";

/**
 * デフォルトのキーバインド定義
 * hotkey-handler.tsに以前ハードコードされていた対応関係をそのまま移植したもの
 * ユーザーが未設定の場合、この内容が使われる
 */
export const DEFAULT_KEY_BINDINGS: KeyBinding[] = [
  // 全ページ共通
  { key: "A-enter", actionId: "submitSearch" },
  { key: "A-l", actionId: "submitSearch" },
  { key: "h", actionId: "goHome" },

  // 検索ページ
  { key: "A-c", actionId: "clearAllInputBox" },
  { key: "n", actionId: "pasteCaseNumber" },
  { key: "d", actionId: "pasteDate" },
  { key: "l", actionId: "pasteLexId" },
  { key: "f", actionId: "focusFreeWord" },
  { key: "S-f", actionId: "focusBlankFreeWord" },
  { key: "A-v", actionId: "pasteSmoothCsv" },
  { key: "v", actionId: "pasteKiri" },

  // 検索結果ページ
  { key: " ", actionId: "openTopResult" },

  // 詳細ページ
  { key: "c", actionId: "copyCaseNumber" },
  { key: "i", actionId: "copyReferenceId" },
  { key: "c-i", actionId: "copyReferenceIdPlain" },
  { key: "S-i", actionId: "copyReferenceIdWithCaseNumber" },
  { key: "A-i", actionId: "copyReferenceNumWithCaseNumber" },
  { key: "z", actionId: "gotoZenbun" },

  // 全文ページ（zキーだが、gotoZenbunとはスコープが違うため別ActionIdが必要）
  { key: "z", actionId: "gotoSyoshi" },

  // 全文ページ or 詳細ページ
  { key: "r", actionId: "gotoSearchResults" },
];
