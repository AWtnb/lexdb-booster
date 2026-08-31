/**
 * 通知を画面右下に表示する
 */
export const showNotification = (doc: Document, message: string): void => {
  const notification = doc.createElement("div");
  notification.textContent = message;
  notification.style.cssText =
    "position:fixed; bottom:20px; right:20px; background:rgba(0,0,0,0.7); color:white; padding:10px; border-radius:5px; z-index:9999;";
  doc.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
};

/**
 * 文字列をクリップボードにコピーする
 */
export const copyString = (doc: Document, s: string): void => {
  navigator.clipboard
    .writeText(s)
    .then(() => {
      showNotification(doc, `copied => ${s}`);
    })
    .catch((err) => {
      console.error("クリップボードへのコピーに失敗しました:", err);
      alert("コピーに失敗しました");
    });
};

/**
 * フレーム内のbodyにフォーカスを設定する
 */
export const focusFrameBody = (
  frame: HTMLFrameElement,
  frameDocument: Document | null,
): void => {
  try {
    frame.focus();
    if (!frameDocument?.body) return;

    frameDocument.body.focus();

    const focusEvent = new FocusEvent("focus", { bubbles: true });
    frameDocument.body.dispatchEvent(focusEvent);

    const clickEvent = new MouseEvent("click", { bubbles: true });
    frameDocument.body.dispatchEvent(clickEvent);

    console.log("bodyFrameにフォーカスを設定しました");
  } catch (focusError) {
    console.error("フォーカス設定エラー:", focusError);
  }
};

/**
 * セレクトボックスの値を設定してchangeイベントを発火する
 */
export const setSelectBoxValue = (
  doc: Document,
  elemId: string,
  value: string,
): void => {
  const selectElement = doc.getElementById(elemId) as HTMLSelectElement;
  selectElement.value = value;
  const changeEvent = new Event("change", { bubbles: true });
  selectElement.dispatchEvent(changeEvent);
};
