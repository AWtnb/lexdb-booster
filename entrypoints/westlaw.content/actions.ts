import {
  matchTimestamp,
  normalize,
  parseCaseNumber,
  YEAR_LABEL_SOURCE,
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
export const pasteDateField = (clipboardText: string): boolean => {
  const timestamp = matchTimestamp(normalize(clipboardText));
  if (!timestamp) return false;

  const yearValue = ERA_YEAR_MAP.get(timestamp.date.label);
  if (!yearValue) return false;

  // 1. 元号をセット
  const eraEl = setSelectValue("ddlJudEra", yearValue);
  if (!eraEl) return false;

  // 2. 年をセット
  const yearEl = setSelectValue("ddlJudYear", String(timestamp.date.year));
  if (!yearEl) return false;

  // 3. 月をセット
  const monthEl = setSelectValue("ddlJudMonth", String(timestamp.date.month));
  if (!monthEl) return false;

  // 4. 日をセット
  const dayEl = setSelectValue("ddlJudDay", String(timestamp.date.day));
  if (!dayEl) return false;

  return true;
};

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
export const pasteCaseNumber = (clipboardText: string): boolean => {
  const caseNumber = parseCaseNumber(normalize(clipboardText));
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
