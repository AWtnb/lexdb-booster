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
const showNotification = (doc: Document, message: string): void => {
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
