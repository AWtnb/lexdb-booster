export const SMOOTH_CSV_COL = {
  COURT: 4,
  DATE: 6,
  DETAIL: 8,
  CASE_NUMBER: 9,
} as const;

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
 * 文字列を正規化する
 * （半角化して先頭のクエスチョンマークを削除する）
 */
export const sanitizeString = (s: string): string => {
  return toHalfWidth(s).replace(/^\?/, "").trim();
};

/**
 * 半角英数字・記号を全角に変換する
 * 範囲：
 *     - 半角アルファベット（`A`～`Z`、`a`～`z`）
 *     - 半角数字（`0`～`9`）
 *     - 半角記号（`!`～`~`）
 */
export const toFullWidth = (str: string): string => {
  if (!str) return str;
  return str.replace(/[\u0021-\u007E]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0xfee0);
  });
};

export const getCurrentClipboardText = async (): Promise<string> => {
  return await navigator.clipboard.readText();
};

/**
 * 年号にコードを割り当てる。明治を1、令和を5にするのは検索ページの
 * 日付選択ボックスの value に対応させている。
 */
export const YEAR_LABEL_SOURCE = [
  { code: "5", labels: ["令和", "令", "R"] },
  { code: "4", labels: ["平成", "平", "H"] },
  { code: "3", labels: ["昭和", "昭", "S"] },
  { code: "2", labels: ["大正", "大", "T"] },
  { code: "1", labels: ["明治", "明", "M"] },
] as const;

/**
 * 年号ラベルをコードに変換するマップ。
 * キーは「令和」「平」「H」などのラベル、値は「5」「4」などのコード。
 */
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

const getCaseNumberMatch = (s: string): RegExpExecArray | null => {
  const fullMatch =
    /(?<label>明治|大正|昭和|平成|令和)(?<year>[0-9]{1,2}|元)年(?<sign>.?\(.{1,3}\))第(?<num>[0-9]+)号/.exec(
      s,
    );
  if (fullMatch) return fullMatch;
  return /(?<label>明治?|大正?|昭和?|平成?|令和?)(?<year>[0-9]{1,2}|元)年?(?<sign>.?\(.{1,3}\))(?<num>[0-9]+)号?/.exec(
    s,
  );
};

/**
 * 文字列で最初に登場する事件番号をパースする
 * 例：
 *    平成２０年（行コ）第３１号→{ code: "4", year: 20, sign: "行コ", num: 31 }
 */
export const parseCaseNumber = (
  str: string,
): { code: string; year: number; sign: string; num: number } | null => {
  const m = getCaseNumberMatch(toHalfWidth(str));
  if (!m) return null;
  const { label, year, sign, num } = m.groups!;
  if (label && year && sign && num) {
    return {
      code: getYearCode(label),
      year: year === "元" ? 1 : parseInt(year),
      sign: sign.replaceAll("(", "").replaceAll(")", ""),
      num: parseInt(num),
    };
  }
  return null;
};

/** 出典の詳細欄を整形する */
export const formatDetail = (detail: string): string => {
  let fmt = sanitizeString(detail);

  // 文字列から最初の連続数字もしくは「（昭58）号145頁」（高刑速報の出典）以降を抽出
  const m = fmt.match(/(\([明大昭平令])?[0-9]+/);
  if (!m) return "";
  fmt = fmt.slice(m.index);

  // 「=」は中黒点に（合併号対策）
  fmt = fmt.replace("=", "・");

  // 2番目以降の場合は頁部分を除去する
  const regSecondPage = /[0-9]+頁[②㋺ロ](事件)?/;
  fmt = fmt.replace(regSecondPage, "");

  return toFullWidth(fmt);
};
