/**
 * 修飾キーのプレフィックスと、対応するKeyboardEventのプロパティ名
 * 配列の順序がそのまま文字列連結の順序になる（唯一の真実）
 * ここを変更すれば全体の順序が追従する
 */
const MODIFIER_ORDER: { prefix: string; eventKey: keyof KeyboardEvent }[] = [
  { prefix: "C-", eventKey: "ctrlKey" },
  { prefix: "A-", eventKey: "altKey" },
  { prefix: "S-", eventKey: "shiftKey" },
];

/**
 * KeyboardEventから修飾キー部分の文字列を組み立てる（例: "C-A-"）
 */
const buildModifierPrefix = (keyEvent: KeyboardEvent): string => {
  return MODIFIER_ORDER.filter(({ eventKey }) => keyEvent[eventKey])
    .map(({ prefix }) => prefix)
    .join("");
};

/**
 * キー入力文字列を生成する（例: "C-A-KeyL"）
 */
export const buildKeyString = (keyEvent: KeyboardEvent): string => {
  return buildModifierPrefix(keyEvent) + keyEvent.code;
};

/**
 * ユーザーがoptionページなどで自由な順序で入力したキー文字列を正規化する
 * 例: "S-A-c" と "A-S-c" はどちらも "A-S-c" になる
 * KeyBinding保存前や読み込み時にこれを通すことで、順序ゆらぎによる不一致を防ぐ
 */
export const normalizeKeyString = (raw: string): string => {
  const parts = raw.split("-");
  const mainKey = parts.pop() ?? "";
  const modSet = new Set(parts.map((p) => `${p}-`));

  const prefix = MODIFIER_ORDER.filter(({ prefix }) => modSet.has(prefix))
    .map(({ prefix }) => prefix)
    .join("");

  return prefix + mainKey;
};

/**
 * 修飾キープレフィックスと表示名の対応
 */
const MODIFIER_DISPLAY: { prefix: string; display: string }[] = [
  { prefix: "C-", display: "Ctrl" },
  { prefix: "A-", display: "Alt" },
  { prefix: "S-", display: "Shift" },
];

/**
 * 内部キー文字列を人が読める形式に変換する
 * 例: "A-S-KeyF" → "Alt+Shift+F"
 *     "Digit3"   → "3"
 *     "Enter"    → "Enter"
 */
export const formatKeyString = (key: string): string => {
  const parts: string[] = [];

  let rest = key;
  for (const { prefix, display } of MODIFIER_DISPLAY) {
    if (!rest.startsWith(prefix)) continue;
    parts.push(display);
    rest = rest.slice(prefix.length);
  }

  const mainKey = rest.startsWith("Key")
    ? rest.slice(3)
    : rest.startsWith("Digit")
      ? rest.slice(5)
      : rest.startsWith("Numpad")
        ? `テンキー${rest.slice(6)}`
        : rest;

  parts.push(mainKey);
  return parts.join("+");
};
