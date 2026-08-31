import type { FrameWindow } from "../types";

/**
 * 検索結果の先頭行を開く処理
 */
export const openTopResult = (win: FrameWindow, doc: Document): void => {
  const anchor = doc.querySelector("tr > td:nth-child(11) a");
  const js = anchor?.getAttribute("href");
  if (!js) return;

  const num = js.substring(37, 45);
  win.ShowBunken?.("ShowSyoshi", num);
};
