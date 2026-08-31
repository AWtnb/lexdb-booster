import {
  getDisplayedCaseNumber,
  getDisplayedReferenceId,
} from "./actions/detail-page";
import { openTopResult } from "./actions/result-page";
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
} from "./actions/search-page";
import { getCurrentClipboardText } from "./text-utils";
import { copyString } from "./ui";
import {
  isDetailPage,
  isSearchResultPage,
  isSearchPage,
  isZenbunPage,
} from "./page";
import type { HotkeyContext } from "./types";

/**
 * ホットキー実行メイン関数
 * キー文字列とページ種別に応じて対応するアクションを呼び出す
 */
export const handleHotkey = async (
  pressed: string,
  ctx: HotkeyContext,
): Promise<void> => {
  const {
    url,
    keyEvent,
    isInputableElem,
    headWindow,
    bodyWindow,
    bodyDocument,
  } = ctx;

  // Alt+Enter: 検索実行
  if (pressed === "A-enter" || pressed === "A-l") {
    pressSubmitButton(ctx);
    return;
  }

  // Home: 検索画面に戻る
  if (pressed === "h") {
    if (!isSearchPage(url)) {
      window.location.href = "https://lex.lawlibrary.jp/lexbin/SearchAll.aspx";
    }
    return;
  }

  // 検索ページ限定のキー
  if (isSearchPage(url) && !isInputableElem) {
    if (await handleSearchPageHotkey(pressed, ctx)) return;
  }

  // 詳細ページ限定のキー
  if (isDetailPage(url)) {
    if (handleDetailPageHotkey(pressed, keyEvent, url, bodyDocument)) return;
  }

  // 検索結果ページ限定のキー
  if (isSearchResultPage(url) && !isInputableElem) {
    if (pressed === " ") {
      openTopResult(bodyWindow, bodyDocument);
      return;
    }
  }

  // 全文ページ限定のキー
  if (isZenbunPage(url)) {
    if (pressed === "z") {
      const dest = new URL(url);
      dest.pathname = "/lexbin/ShowSyoshi.aspx";
      window.location.href = dest.toString();
      return;
    }
  }
};

/**
 * 検索ページ限定キーの処理
 * @returns 処理済みならtrue
 */
const handleSearchPageHotkey = async (
  pressed: string,
  ctx: HotkeyContext,
): Promise<boolean> => {
  if (pressed === "A-c") {
    clearAllInputBox(ctx);
    return true;
  }

  const cb = await getCurrentClipboardText();
  if (pressed === "n") {
    clearAllInputBox(ctx);
    handleCaseNumberPaste(ctx, cb);
    pressSubmitButton(ctx);
    return true;
  }

  if (pressed === "d") {
    handleDatePaste(ctx, cb);
    return true;
  }

  if (pressed === "l") {
    clearAllInputBox(ctx);
    handleLexIdPaste(ctx, cb);
    pressSubmitButton(ctx);
    return true;
  }

  if (pressed === "f") {
    handleFreeWordFocus(ctx);
    return true;
  }

  if (pressed === "S-f") {
    handleBlankFreeWordFocus(ctx);
    return true;
  }

  if (pressed === "A-v") {
    clearAllInputBox(ctx);
    handleSmoothCsvPaste(ctx, cb);
    pressSubmitButton(ctx);
    return true;
  }

  if (pressed === "v") {
    clearAllInputBox(ctx);
    await handleKiriPaste(ctx);
    return true;
  }

  return false;
};

/**
 * 詳細ページ限定キーの処理
 * @returns 処理済みならtrue
 */
const handleDetailPageHotkey = (
  pressed: string,
  keyEvent: KeyboardEvent,
  url: URL,
  bodyDocument: Document,
): boolean => {
  if (pressed === "c" && !keyEvent.ctrlKey) {
    const caseNum = getDisplayedCaseNumber(bodyDocument);
    if (caseNum) {
      copyString(bodyDocument, caseNum);
    } else {
      const refId = getDisplayedReferenceId(bodyDocument);
      copyString(bodyDocument, "事件番号なし。" + refId.replaceAll("\t", ""));
    }
    return true;
  }

  if (pressed === "i") {
    const refId = getDisplayedReferenceId(bodyDocument);
    if (refId) {
      copyString(bodyDocument, refId);
    }
    return true;
  }

  if (pressed === "C-i") {
    const refId = getDisplayedReferenceId(bodyDocument);
    if (refId) {
      copyString(bodyDocument, refId.replaceAll("\t", ""));
    }
    return true;
  }

  if (pressed === "S-i") {
    const refId = getDisplayedReferenceId(bodyDocument);
    const caseNum = getDisplayedCaseNumber(bodyDocument);
    if (refId && caseNum) {
      copyString(bodyDocument, `${refId}\t${caseNum}`);
    }
    return true;
  }

  if (pressed === "A-i") {
    const refId = getDisplayedReferenceId(bodyDocument);
    const caseNum = getDisplayedCaseNumber(bodyDocument);
    if (refId && caseNum) {
      copyString(bodyDocument, `${refId.split("\t")[1]}\t${caseNum}`);
    }
    return true;
  }

  if (pressed === "z") {
    const dest = new URL(url);
    dest.pathname = "/lexbin/ShowZenbun.aspx";
    window.location.href = dest.toString();
    return true;
  }

  return false;
};
