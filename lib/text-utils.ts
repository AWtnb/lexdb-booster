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
 * 年号にコードを割り当てる。明治を1、令和を5にするのは検索ページの
 * 日付選択ボックスの value に対応させている。
 */
const YEAR_LABEL_SOURCE = [
  { code: "5", labels: ["令和", "令", "R"] },
  { code: "4", labels: ["平成", "平", "H"] },
  { code: "3", labels: ["昭和", "昭", "S"] },
  { code: "2", labels: ["大正", "大", "T"] },
  { code: "1", labels: ["明治", "明", "M"] },
] as const;

const YEAR_LABELS = new Map(
  YEAR_LABEL_SOURCE.flatMap(({ code, labels }) =>
    labels.map((label) => [label, code] as const),
  ),
);

type YearLabel = Parameters<typeof YEAR_LABELS.get>[0];

/**
 * 元号コードを取得する（令和→5、平成→4など）
 */
export const getYearCode = (s: string): string =>
  YEAR_LABELS.get(s as YearLabel) ?? "";

const TIMESTAMP_REGEX =
  /(……)?(?<year>[0-9０-９]{1,2}|元)(（[0-9]{4}）)?[年・\.](?<month>[0-9０-９]{1,2})[月・\.](?<day>[0-9０-９]{1,2})日?/;

const ALL_YEAR_LABELS = [...YEAR_LABELS.keys()];

export type Timestamp = {
  text: string;
  start: number;
  end: number;
  date: {
    label: string;
    year: number;
    month: number;
    day: number;
  };
};

/**
 * 日付文字列を抽出する
 */
export const matchTimestamp = (s: string): Timestamp | null => {
  const m = TIMESTAMP_REGEX.exec(s);
  if (!m) return null;

  const prefix = s.slice(0, m.index);
  const label = ALL_YEAR_LABELS.find((l) => prefix.endsWith(l));
  if (!label) return null;

  const { year, month, day } = m.groups!;
  return {
    text: label + m[0],
    start: m.index - label.length,
    end: m.index + m[0].length,
    date: {
      label,
      year: m[2] === "元" ? 1 : parseInt(toHalfWidth(year!)),
      month: parseInt(toHalfWidth(month!)),
      day: parseInt(toHalfWidth(day!)),
    },
  };
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
    .replaceAll("?", "")
    .replace("元年", "1年")
    .replace(/^\(/, "")
    .replace(/\)$/, "")
    .split("、");
  if (!top) return null;
  const [fullYear, sign, fullNum] = top
    .replace(/号.+$/, "号")
    .replace(/[\(\)]/g, "_")
    .split("_");
  if (!fullYear || !sign || !fullNum) return null;
  return {
    code: getYearCode(fullYear),
    year: parseInt(fullYear.replace(/[^0-9]/g, "")),
    sign: sign,
    num: parseInt(fullNum.replace(/[^0-9]/g, "")),
  };
};
