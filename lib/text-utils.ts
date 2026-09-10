/**
 * 全角英数字・記号を半角に変換する
 * 範囲：
 *     - 全角アルファベット（`Ａ`～`Ｚ`、`ａ`～`ｚ`）
 *     - 全角数字（`０`～`９`）
 *     - 全角記号（`！`～`～`）
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
 * 元号コードを取得する（令和→5、平成→4など）
 */
export const getYearCode = (s: string): string => {
  if (s.startsWith("令和") || s.startsWith("令")) return "5";
  if (s.startsWith("平成") || s.startsWith("平")) return "4";
  if (s.startsWith("昭和") || s.startsWith("昭")) return "3";
  if (s.startsWith("大正") || s.startsWith("大")) return "2";
  if (s.startsWith("明治") || s.startsWith("明")) return "1";
  return "5";
};

/**
 * 元号付き日付を元号コードと3つの数値に分解
 * @returns [元号コード, 年, 月, 日]
 */
export const parseDateString = (
  s: string,
): { code: string; y: string; m: string; d: string } => {
  const code = getYearCode(s);
  const [y, m, d] = toHalfWidth(s)
    .replace("元", "1")
    .replace(/^[^\d]+/, "")
    .replace(/[^\d]+$/, "")
    .replace(/[^\d]+/g, "_")
    .split("_");
  return { code, y: y || "", m: m || "", d: d || "" };
};

/**
 * 文字列から最初の連続数字以降を抽出
 */
export const getReferenceDetail = (str: string): string => {
  const m = str.match(/[0-9０-９]+/);
  if (!m) return str;
  return str.slice(m.index);
};

/**
 * 文字列（の先頭）の事件番号をパースする
 * 例：
 *    平成２０年（行コ）第３１号→{ code: "4", year: 20, sign: "行コ", num: 31 }
 */
export const parseCaseNumber = (
  str: string,
): { code: string; year: number; sign: string; num: number } | null => {
  const [top] = toHalfWidth(str)
    .replace(/^\?/, "")
    .replace(/^\(/, "")
    .replace(/\)$/, "")
    .split("、");
  if (!top) return null;
  const [fullYear, sign, fullNum] = top.replace(/[\(\)]/g, "_").split("_");
  if (!fullYear || !sign || !fullNum) return null;
  return {
    code: getYearCode(fullYear),
    year: parseInt(fullYear.replace(/[^0-9]/g, "")),
    sign: sign,
    num: parseInt(fullNum.replace(/[^0-9]/g, "")),
  };
};
