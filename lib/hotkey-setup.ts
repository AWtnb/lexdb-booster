import { buildKeyString } from "./keystring";
import { handleHotkey } from "./hotkey-handler";
import { applyDetailPageStyles, applySearchResultPageStyles } from "./styles";
import { focusFrameBody } from "./ui";
import { isDetailPage, isSearchResultPage } from "./page";
import { toggleHelpOverlay } from "./ui";
import { getActiveBindings } from "./help";
import type { FrameWindow } from "./types";

const RETRY_INTERVAL_MS = 3000;
const MAX_RETRIES = 5;

/**
 * ホットキー設定関数
 * フレーム取得・スタイル適用・keyupハンドラの登録を行う
 */
const setupHotkeys = (): void => {
  try {
    console.log("ホットキー設定を試みています...");

    const frames = document.getElementsByTagName("frame");
    if (frames.length < 2) {
      console.log("フレームが見つかりません");
      return;
    }

    const [headFrame, bodyFrame] = frames;
    if (!headFrame) {
      console.log("headフレームがありません");
      return;
    }
    if (!bodyFrame) {
      console.log("bodyフレームがありません");
      return;
    }

    const headWindow = headFrame.contentWindow as FrameWindow;
    const headDocument = headFrame.contentDocument || headWindow.document;
    const bodyWindow = bodyFrame.contentWindow as FrameWindow;
    const bodyDocument = bodyFrame.contentDocument || bodyWindow.document;

    if (bodyWindow._hotkeyInitialized) {
      console.log("すでにホットキーが初期化されています");
      return;
    }

    focusFrameBody(bodyFrame, bodyDocument);
    const url = new URL(window.location.href);

    if (isDetailPage(url) && url.search.indexOf("debug") === -1) {
      applyDetailPageStyles(bodyDocument);
    }

    if (isSearchResultPage(url) && url.search.indexOf("debug") === -1) {
      applySearchResultPageStyles(bodyDocument);
    }

    bodyDocument.onkeyup = async (keyEvent) => {
      console.log({ key: keyEvent.key }, { code: keyEvent.code });
      const pressed = buildKeyString(keyEvent);

      const target = keyEvent.target as HTMLElement;
      const isInputableElem =
        target.tagName === "TEXTAREA" ||
        (target.tagName === "INPUT" &&
          !["checkbox", "radio"].includes(
            (target as HTMLInputElement).type.toLowerCase(),
          ));

      // Qキーでヘルプ表示トグル
      if (pressed === "KeyQ" && !isInputableElem) {
        const bindings = getActiveBindings(url);
        toggleHelpOverlay(bodyDocument, bindings);
        return;
      }

      await handleHotkey(pressed, {
        url,
        keyEvent,
        isInputableElem,
        headWindow,
        headDocument,
        bodyWindow,
        bodyDocument,
      });
    };

    bodyWindow._hotkeyInitialized = true;
    console.log("ホットキーの設定が完了しました");
  } catch (e) {
    console.error("ホットキー設定エラー:", e);
  }
};

/**
 * スクリプト初期化とリトライ処理
 * フレームの読み込みタイミングによって初回のsetupHotkeysが
 * 失敗することがあるため、一定間隔でリトライする
 */
export const initializeScript = (): void => {
  setupHotkeys();

  let retryCount = 0;
  const retryInterval = setInterval(() => {
    retryCount++;
    if (retryCount >= MAX_RETRIES) {
      clearInterval(retryInterval);
      return;
    }
    setupHotkeys();
  }, RETRY_INTERVAL_MS);
};
