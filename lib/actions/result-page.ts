import type { HotkeyAction } from "../types";

/**
 * 検索結果の先頭行を開く処理
 */
export const openTopResult: HotkeyAction = ({
  bodyWindow,
  bodyDocument,
  keyEvent,
}): void => {
  const anchor = bodyDocument.querySelector("tr > td:nth-child(11) a");
  const js = anchor?.getAttribute("href");
  if (!js) return;

  keyEvent.preventDefault();
  keyEvent.stopPropagation();
  const num = js.substring(37, 45);
  bodyWindow.ShowBunken?.("ShowSyoshi", num);
};
