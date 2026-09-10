import type { HotkeyAction, HotkeyContext } from "../types";

const openResult = (ctx: HotkeyContext, index: number): void => {
  const anchors = Array.from(
    ctx.bodyDocument.querySelectorAll("tr > td[rowspan='3'] a"),
  );
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
export const makeOpenResultAction =
  (index: number): HotkeyAction =>
  (ctx) =>
    openResult(ctx, index);
