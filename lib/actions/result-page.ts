import type {
  ActionId,
  HotkeyAction,
  HotkeyContext,
  OpenResultId,
} from "../types";
import type { ActionEntry } from "./registry";

export const getSyoshiAnchors = (doc: Document): Element[] =>
  Array.from(doc.querySelectorAll("tr > td[rowspan='3'] a"));

const openResult = (ctx: HotkeyContext, index: number): void => {
  const anchors = getSyoshiAnchors(ctx.bodyDocument);
  if (!anchors) return;
  const target = anchors[index * 2];
  const js = target?.getAttribute("href");
  if (!js) return;

  const num = js.substring(37, 45);
  ctx.bodyWindow.ShowBunken?.("ShowSyoshi", num);
};

/**
 * 検索結果の先頭行を開く処理
 */
export const openTopResult: HotkeyAction = (ctx): void => {
  openResult(ctx, 0);
};

/** 検索結果のN番目(0始まり)を開く処理 */
const makeOpenResultAction =
  (index: number): HotkeyAction =>
  (ctx) =>
    openResult(ctx, index);

export const openResultEntries = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).reduce<
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
