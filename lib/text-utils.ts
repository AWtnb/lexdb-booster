/**
 * 全角英数字・記号を半角に変換する
 */
export const toHalfWidth = (str: string): string => {
  if (!str) return str;
  return str.replace(/[\uFF01-\uFF5E]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
  });
};

/**
 * 数字を半角から全角に変換する
 */
export const toFullWidthDigits = (input: string | number): string => {
  const str = String(input);
  return str.replace(/[0-9]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 65248);
  });
};

export const getCurrentClipboardText = async (): Promise<string> => {
  return await navigator.clipboard.readText();
};

/**
 * 元号コードを展開する（令和→5、平成→4など）
 */
export const expandGengo = (g: string): number => {
  const gengoMap: Record<string, number> = {
    令: 5,
    平: 4,
    昭: 3,
    大: 2,
    明: 1,
  };
  return gengoMap[g] || 5;
};

/**
 * 元号付き日付を元号コードと3つの数値に分解
 * @returns [元号コード, 年, 月, 日]
 */
export const toGengouAndTripletNum = (s: string): string[] => {
  const g = expandGengo(s.substring(0, 1));
  const normalized = s
    .replace("元", "1")
    .replace(/^[^\d]+/, "")
    .replace(/[^\d]+$/, "");
  return [g.toString()].concat(normalized.split(/[^\d+]/).slice(0, 3));
};

/**
 * 文字列から最初の連続数字以降を抽出
 */
export const getReferenceDetail = (str: string): string => {
  const m = str.match(/[0-9０-９]+/);
  if (!m) return str;
  return str.slice(m.index);
};
