import { getDisplayedCaseNumber, getDisplayedReferenceId } from "./detail-page";
import { openTopResult } from "./result-page";
import {
  clearAllInputBox,
  handleCaseNumberPaste,
  handleDatePaste,
  handleFreeWordFocus,
  handleBlankFreeWordFocus,
  handleKiriPaste,
  handleLexIdPaste,
  handleSmoothCsvPaste,
  pressSubmitButton,
} from "./search-page";
import { copyString } from "../ui";
import type { ActionId, HotkeyContext } from "../types";

/** アクションが有効なページスコープ */
export type PageScope = "search" | "searchResult" | "detail" | "zenbun" | "any";

/** レジストリ1エントリの定義 */
export type ActionEntry = {
  /** オプションページ表示用の日本語ラベル */
  label: string;
  /** 有効なページスコープ */
  scope: PageScope;
  /** クリップボード読み取りが必要か */
  needsClipboard: boolean;
  /** 実行本体。clipboardTextは needsClipboard が true の時のみ渡される */
  run: (ctx: HotkeyContext, clipboardText: string) => void | Promise<void>;
};

/**
 * 事件番号コピー処理（detail-page.tsから分離したロジック）
 * 元はhotkey-handler.ts内にインラインで書かれていた
 */
const copyCaseNumber = (ctx: HotkeyContext): void => {
  const { bodyDocument } = ctx;
  const caseNum = getDisplayedCaseNumber(bodyDocument);
  if (caseNum) {
    copyString(bodyDocument, caseNum);
    return;
  }
  const refId = getDisplayedReferenceId(bodyDocument);
  copyString(bodyDocument, "事件番号なし。" + refId.replaceAll("\t", ""));
};

const copyReferenceId = (ctx: HotkeyContext): void => {
  const refId = getDisplayedReferenceId(ctx.bodyDocument);
  if (refId) copyString(ctx.bodyDocument, refId);
};

const copyReferenceIdPlain = (ctx: HotkeyContext): void => {
  const refId = getDisplayedReferenceId(ctx.bodyDocument);
  if (refId) copyString(ctx.bodyDocument, refId.replaceAll("\t", ""));
};

const copyReferenceIdWithCaseNumber = (ctx: HotkeyContext): void => {
  const { bodyDocument } = ctx;
  const refId = getDisplayedReferenceId(bodyDocument);
  const caseNum = getDisplayedCaseNumber(bodyDocument);
  if (refId && caseNum) copyString(bodyDocument, `${refId}\t${caseNum}`);
};

const copyReferenceNumWithCaseNumber = (ctx: HotkeyContext): void => {
  const { bodyDocument } = ctx;
  const refId = getDisplayedReferenceId(bodyDocument);
  const caseNum = getDisplayedCaseNumber(bodyDocument);
  if (refId && caseNum) {
    copyString(bodyDocument, `${refId.split("\t")[1]}\t${caseNum}`);
  }
};

const gotoZenbun = (ctx: HotkeyContext): void => {
  const dest = new URL(ctx.url);
  dest.pathname = "/lexbin/ShowZenbun.aspx";
  window.location.href = dest.toString();
};

const gotoSyoshi = (ctx: HotkeyContext): void => {
  const dest = new URL(ctx.url);
  dest.pathname = "/lexbin/ShowSyoshi.aspx";
  window.location.href = dest.toString();
};

const goHome = (): void => {
  window.location.href = "https://lex.lawlibrary.jp/lexbin/SearchAll.aspx";
};

/**
 * ActionIdごとの実体定義
 * オプションページのプルダウンにはこのlabelを表示する
 */
export const ACTION_REGISTRY: Record<ActionId, ActionEntry> = {
  submitSearch: {
    label: "検索実行",
    scope: "any",
    needsClipboard: false,
    run: (ctx) => pressSubmitButton(ctx),
  },
  goHome: {
    label: "検索画面に戻る",
    scope: "any",
    needsClipboard: false,
    run: () => goHome(),
  },
  clearAllInputBox: {
    label: "入力欄をすべてクリア",
    scope: "search",
    needsClipboard: false,
    run: (ctx) => clearAllInputBox(ctx),
  },
  pasteCaseNumber: {
    label: "事件番号を貼り付けて検索",
    scope: "search",
    needsClipboard: true,
    run: (ctx, cb) => {
      clearAllInputBox(ctx);
      handleCaseNumberPaste(ctx, cb);
      pressSubmitButton(ctx);
    },
  },
  pasteDate: {
    label: "日付を貼り付け",
    scope: "search",
    needsClipboard: true,
    run: (ctx, cb) => handleDatePaste(ctx, cb),
  },
  pasteLexId: {
    label: "LEX文献番号を貼り付けて検索",
    scope: "search",
    needsClipboard: true,
    run: (ctx, cb) => {
      clearAllInputBox(ctx);
      handleLexIdPaste(ctx, cb);
      pressSubmitButton(ctx);
    },
  },
  focusFreeWord: {
    label: "フリーワード欄にフォーカス（末尾）",
    scope: "search",
    needsClipboard: false,
    run: (ctx) => handleFreeWordFocus(ctx),
  },
  focusBlankFreeWord: {
    label: "フリーワード欄にフォーカス（空欄）",
    scope: "search",
    needsClipboard: false,
    run: (ctx) => handleBlankFreeWordFocus(ctx),
  },
  pasteSmoothCsv: {
    label: "SmoothCSVを貼り付けて検索",
    scope: "search",
    needsClipboard: true,
    run: (ctx, cb) => {
      clearAllInputBox(ctx);
      handleSmoothCsvPaste(ctx, cb);
      pressSubmitButton(ctx);
    },
  },
  pasteKiri: {
    label: "桐の行コピーを貼り付け",
    scope: "search",
    needsClipboard: true,
    run: (ctx, cb) => {
      clearAllInputBox(ctx);
      return handleKiriPaste(ctx, cb);
    },
  },
  copyCaseNumber: {
    label: "事件番号をコピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyCaseNumber(ctx),
  },
  copyReferenceId: {
    label: "文献番号をコピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyReferenceId(ctx),
  },
  copyReferenceIdPlain: {
    label: "文献番号をコピー（タブなし）",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyReferenceIdPlain(ctx),
  },
  copyReferenceIdWithCaseNumber: {
    label: "文献番号と事件番号をコピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyReferenceIdWithCaseNumber(ctx),
  },
  copyReferenceNumWithCaseNumber: {
    label: "文献番号（先頭部除く）と事件番号をコピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyReferenceNumWithCaseNumber(ctx),
  },
  gotoZenbun: {
    label: "全文ページへ移動",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => gotoZenbun(ctx),
  },
  gotoSyoshi: {
    label: "書誌ページへ移動",
    scope: "zenbun",
    needsClipboard: false,
    run: (ctx) => gotoSyoshi(ctx),
  },
  openTopResult: {
    label: "検索結果の先頭を開く",
    scope: "searchResult",
    needsClipboard: false,
    run: (ctx) => openTopResult(ctx),
  },
};
