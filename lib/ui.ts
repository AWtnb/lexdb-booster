const CONTAINER_ID = "extension-notification-container";

/**
 * 通知コンテナを取得（存在しなければ作成）する
 */
const getOrCreateContainer = (doc: Document): HTMLElement => {
  const existing = doc.getElementById(CONTAINER_ID);
  if (existing !== null) return existing;

  const container = doc.createElement("div");
  container.id = CONTAINER_ID;
  container.style.cssText = [
    "position:fixed",
    "bottom:20px",
    "right:20px",
    "display:flex",
    "flex-direction:column",
    "align-items:flex-end",
    "gap:8px",
    "z-index:9999",
    "pointer-events:none",
  ].join(";");
  doc.body.appendChild(container);
  return container;
};

/**
 * 通知を画面右下に表示する。複数回呼ぶと下から上に積み上がる
 */
export const showNotification = (doc: Document, message: string): void => {
  const container = getOrCreateContainer(doc);

  const notification = doc.createElement("div");
  notification.textContent = message;
  notification.style.cssText = [
    "background:rgba(0,0,0,0.7)",
    "color:white",
    "padding:10px",
    "border-radius:5px",
    "pointer-events:auto",
    "opacity:0",
    "transform:translateY(8px)",
    "transition:opacity 0.2s ease, transform 0.2s ease",
  ].join(";");

  // 一番下に追加 → flex-direction:column なので新しい通知が一番下に積まれる
  container.appendChild(notification);

  // 追加直後にフェードイン
  requestAnimationFrame(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateY(8px)";
    // フェードアウト完了後に要素を削除
    notification.addEventListener(
      "transitionend",
      () => notification.remove(),
      { once: true },
    );
  }, 5000);
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

const HELP_OVERLAY_ID = "extension-help-overlay";

/**
 * 現在ページのキーバインド一覧オーバーレイを左下に表示/非表示トグル
 */
export const toggleHelpOverlay = (
  doc: Document,
  bindings: { key: string; label: string }[],
): void => {
  const existing = doc.getElementById(HELP_OVERLAY_ID);
  if (existing !== null) {
    existing.remove();
    return;
  }

  const overlay = doc.createElement("div");
  overlay.id = HELP_OVERLAY_ID;
  overlay.style.cssText = [
    "position:fixed",
    "bottom:20px",
    "left:20px",
    "background:rgba(0,0,0,0.75)",
    "color:white",
    "padding:12px 16px",
    "border-radius:8px",
    "z-index:9999",
    "font-size:13px",
    "line-height:1.8",
    "pointer-events:none",
    "max-height:80vh",
    "overflow-y:auto",
  ].join(";");

  const title = doc.createElement("div");
  title.textContent = "⌨ キーボードショートカット";
  title.style.cssText = [
    "font-weight:bold",
    "margin-bottom:6px",
    "font-size:14px",
    "border-bottom:1px solid rgba(255,255,255,0.4)",
    "padding-bottom:4px",
  ].join(";");
  overlay.appendChild(title);

  for (const { key, label } of bindings) {
    const row = doc.createElement("div");
    row.style.cssText =
      "display:flex;gap:12px;align-items:baseline;margin:8px 0;";

    const keyBadge = doc.createElement("span");
    keyBadge.textContent = key;
    keyBadge.style.cssText = [
      "font-family:monospace",
      "background:rgba(255,255,255,0.15)",
      "padding:1px 6px",
      "border-radius:4px",
      "min-width:80px",
      "display:inline-block",
      "text-align:center",
      "flex-shrink:0",
    ].join(";");

    const labelEl = doc.createElement("span");
    labelEl.textContent = label;

    row.appendChild(keyBadge);
    row.appendChild(labelEl);
    overlay.appendChild(row);
  }

  doc.body.appendChild(overlay);
};
