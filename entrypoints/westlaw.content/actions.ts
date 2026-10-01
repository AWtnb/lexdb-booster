import {
  deriveLeadingCourtName,
  expandCourtAbbrev,
  formatCourtName,
} from "@/lib/court";
import {
  matchTimestamp,
  normalize,
  parseCaseNumber,
  SMOOTH_CSV_COL,
  YEAR_LABEL_SOURCE,
  type Timestamp,
} from "@/lib/text-utils";

const ERA_YEAR_MAP = new Map([
  ["令", "236"],
  ["平", "235"],
  ["昭", "234"],
  ["大", "233"],
  ["明", "232"],
]);

/**
 * selectElementのvalueをセットし、onchangeイベントを発火する
 */
const setSelectValue = (
  id: string,
  value: string,
): HTMLSelectElement | null => {
  const el = document.getElementById(id) as HTMLSelectElement | null;
  if (!el) return null;

  el.value = value;
  el.dispatchEvent(new Event("change"));
  return el;
};

/**
 * 日付欄を埋める
 */
const fillDateFields = (s: string): Timestamp | null => {
  const timestamp = matchTimestamp(normalize(s));
  if (!timestamp) return null;

  const yearValue = ERA_YEAR_MAP.get(timestamp.date.label.slice(0, 1));
  if (!yearValue) return null;

  // 1. 元号をセット
  const eraEl = setSelectValue("ddlJudEra", yearValue);
  if (!eraEl) return null;

  // 2. 年をセット
  const yearEl = setSelectValue("ddlJudYear", String(timestamp.date.year));
  if (!yearEl) return null;

  // 3. 月をセット
  const monthEl = setSelectValue("ddlJudMonth", String(timestamp.date.month));
  if (!monthEl) return null;

  // 4. 日をセット
  const dayEl = setSelectValue("ddlJudDay", String(timestamp.date.day));
  if (!dayEl) return null;
  return timestamp;
};

export const pasteDateField = (clipboardText: string): boolean =>
  fillDateFields(clipboardText) !== null;

/**
 * 年号コードから元号選択ボックスのvalue（漢字1文字）に変換するマップ
 */
const YEAR_CODE_TO_ERA_VALUE = new Map(
  YEAR_LABEL_SOURCE.map(({ code, labels }) => [code, labels[1]] as const),
);

type YearCode = (typeof YEAR_LABEL_SOURCE)[number]["code"];

/**
 * 事件番号欄を埋める
 */
const fillCaseNumber = (s: string): boolean => {
  const caseNumber = parseCaseNumber(normalize(s));
  if (!caseNumber) return false;

  // 1. 元号をセット
  const eraValue = YEAR_CODE_TO_ERA_VALUE.get(caseNumber.code as YearCode);
  if (!eraValue) return false;

  const eraEl = setSelectValue("ddlCaseNumEra", eraValue);
  if (!eraEl) return false;

  // 2. 年をセット
  const yearEl = document.getElementById(
    "ddlCaseNumYear",
  ) as HTMLSelectElement | null;
  if (!yearEl) return false;
  yearEl.value = String(caseNumber.year);

  const yearElFlex = document.getElementById(
    "ddlCaseNumYear_flexselect",
  ) as HTMLInputElement | null;
  if (!yearElFlex) return false;
  yearElFlex.value = String(caseNumber.year);

  // 3. 符号・事件番号をセット
  const signEl = document.getElementById(
    "fldCourtId",
  ) as HTMLInputElement | null;
  if (!signEl) return false;
  signEl.value = caseNumber.sign;

  const numEl = document.getElementById(
    "fldCaseNum",
  ) as HTMLInputElement | null;
  if (!numEl) return false;
  numEl.value = String(caseNumber.num);

  return true;
};

export const pasteCaseNumber = (clipboardText: string): boolean => {
  if (fillCaseNumber(clipboardText)) {
    return pressSubmitButton();
  }
  return false;
};

const fillFreewords = (freewords: string[]): boolean => {
  const el = document.getElementById("ft") as HTMLInputElement | null;
  if (!el) return false;
  el.value = freewords.filter(Boolean).join(" ").trim();
  return 0 < el.value.length;
};
/**
 * WLJPのIDを取得できればフリーワード欄に入力
 */
const fillWljpId = (s: string): boolean => {
  const m = /[0-9]{4}WLJPCA[0-9]{8}/.exec(normalize(s));
  if (!m) return false;
  const [t] = m;
  return fillFreewords([t]);
};

export const pasteWljpId = (clipboardText: string): boolean => {
  if (fillWljpId(clipboardText)) {
    return pressSubmitButton();
  }
  return false;
};

/**
 * 判例文字列からの貼り付け
 * 例：「札幌地判令和3・3・17判時2487号3頁」
 */
const pastePrecedent = (s: string): boolean => {
  if (fillWljpId(s)) {
    return true;
  }
  const caseNumberFillResult = fillCaseNumber(s);
  const filledTimestamp = fillDateFields(s);

  const freewords = [];

  const courtName = deriveLeadingCourtName(s);
  if (courtName) freewords.push(formatCourtName(courtName));

  const freewordFillResult = fillFreewords(freewords);

  return caseNumberFillResult || filledTimestamp !== null || freewordFillResult;
};

/**
 * 事件番号調査用のCSVから一括貼り付け
 * SmoothCSVからのコピーを前提に、列はタブ区切りで扱う
 */
const pasteSmoothCsv = (s: string): boolean => {
  const fields = s.split("\t").map(normalize);
  const court = fields[SMOOTH_CSV_COL.COURT]!;
  const date = fields[SMOOTH_CSV_COL.DATE]!;
  const detail = fields[SMOOTH_CSV_COL.DETAIL]!;
  const casenumber = fields[SMOOTH_CSV_COL.CASE_NUMBER]!;

  if (fillWljpId(detail)) {
    return true;
  }

  if (fillCaseNumber(casenumber)) {
    return true;
  }

  const freewords = [];
  const courtExpanded = expandCourtAbbrev(court);
  if (courtExpanded) freewords.push(formatCourtName(courtExpanded));

  const dateFillResult = fillDateFields(date) !== null;
  const freewordFillResult = fillFreewords(freewords);
  return dateFillResult || freewordFillResult;
};

/**
 * タブ区切りの文字列であれば、SmoothCSVの貼り付け処理を行い、
 * そうでなければ判例文字列の貼り付け処理を行う
 */
export const pasteAndSearch = (clipboardText: string) => {
  const result = (() => {
    if (10 <= clipboardText.split("\t").length) {
      return pasteSmoothCsv(clipboardText);
    }
    return pastePrecedent(clipboardText);
  })();
  if (!result) return false;
  return pressSubmitButton();
};

export const goSearchHome = (): boolean => {
  window.location.href =
    "https://go.westlawjapan.com/wljp/app/search/template?tid=wljpCasesSearchTemplate&clean=true";
  return true;
};

export const pressSubmitButton = (): boolean => {
  document.getElementById("submitSearch")?.click();
  return true;
};

export const pressClearButton = (): boolean => {
  window.location.href =
    "https://go.westlawjapan.com/wljp/app/search/template/clear?tid=wljpCasesSearchTemplate";
  return true;
};
