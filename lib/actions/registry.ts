import { makeOpenResultAction, openTopResult } from "./result-page";
import {
  clearAllInputBox,
  cycleFreeWord,
  focusFreeWord,
  pasteCaseNumber,
  pasteDate,
  pasteLexId,
  pasteSmoothCsv,
  pressSubmitButton,
} from "./search-page";
import type { ActionId, HotkeyContext, OpenResultId } from "../types";
import {
  copyCaseNumber,
  copyFullReference,
  copyReference,
  copyReferenceId,
  copyReferenceTsv,
  gotoSearchResults,
  gotoZenbun,
} from "./detail-page";
import { gotoSyoshi } from "./zenbun-page";

/** アクションが有効なページスコープ */
export type PageScope =
  | "search"
  | "searchResult"
  | "detail"
  | "zenbun"
  | "detailOrZenbun"
  | "any";

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

const goHome = (): void => {
  window.location.href = "https://lex.lawlibrary.jp/lexbin/SearchAll.aspx";
};

const openResultEntries = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).reduce<
  Pick<Record<ActionId, ActionEntry>, OpenResultId>
>(
  (acc, n) => {
    acc[`openResult${n}`] = {
      label: `検索結果の${n}件目を開く`,
      scope: "searchResult",
      needsClipboard: false,
      run: makeOpenResultAction(n - 1),
    };
    return acc;
  },
  {} as Pick<Record<ActionId, ActionEntry>, OpenResultId>,
);

/**
 * ActionIdごとの実体定義
 * オプションページのプルダウンにはこのlabelを表示する
 */
export const ACTION_REGISTRY: Record<ActionId, ActionEntry> = {
  submitSearch: {
    label: "検索実行",
    scope: "search",
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
      pasteCaseNumber(ctx, cb);
      pressSubmitButton(ctx);
    },
  },
  pasteDate: {
    label: "日付を貼り付け",
    scope: "search",
    needsClipboard: true,
    run: (ctx, cb) => pasteDate(ctx, cb),
  },
  pasteLexId: {
    label: "LEX文献番号を貼り付けて検索",
    scope: "search",
    needsClipboard: true,
    run: (ctx, cb) => {
      clearAllInputBox(ctx);
      pasteLexId(ctx, cb);
      pressSubmitButton(ctx);
    },
  },
  focusFreeWord: {
    label: "フリーワード欄（末尾）にフォーカス",
    scope: "search",
    needsClipboard: false,
    run: (ctx) => focusFreeWord(ctx),
  },
  cycleFreeWord: {
    label: "ANDフリーワード欄にフォーカス",
    scope: "search",
    needsClipboard: false,
    run: (ctx) => cycleFreeWord(ctx),
  },
  pasteSmoothCsv: {
    label: "SmoothCSVから貼り付けて検索",
    scope: "search",
    needsClipboard: true,
    run: (ctx, cb) => {
      clearAllInputBox(ctx);
      pasteSmoothCsv(ctx, cb);
      pressSubmitButton(ctx);
    },
  },
  copyCaseNumber: {
    label: "事件番号をコピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyCaseNumber(ctx),
  },
  copyReference: {
    label: "「LEX/DB ●●」形式で出典コピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyReference(ctx),
  },
  copyReferenceTsv: {
    label: "「LEX/DB」と文献番号と事件番号をタブ区切りでコピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyReferenceTsv(ctx),
  },
  copyReferenceId: {
    label: "文献番号をコピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyReferenceId(ctx),
  },
  copyFullReference: {
    label: "判例としてコピー",
    scope: "detail",
    needsClipboard: false,
    run: (ctx) => copyFullReference(ctx),
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
  gotoSearchResults: {
    label: "検索結果へ移動",
    scope: "detailOrZenbun",
    needsClipboard: false,
    run: (ctx) => gotoSearchResults(ctx),
  },
  openTopResult: {
    label: "検索結果の先頭を開く",
    scope: "searchResult",
    needsClipboard: false,
    run: (ctx) => openTopResult(ctx),
  },
  ...openResultEntries,
};
