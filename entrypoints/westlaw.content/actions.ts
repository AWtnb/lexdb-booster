import { copyString } from "@/lib/copy";
import {
  deriveLeadingCourtName,
  expandCourtAbbrev,
  formatCourtName,
} from "@/lib/court";
import {
  matchTimestamp,
  parseCaseNumber,
  sanitizeString,
  SMOOTH_CSV_COL,
  YEAR_LABEL_ABBREV_TO_FULL,
  type Timestamp,
} from "@/lib/text-utils";

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
  const timestamp = matchTimestamp(sanitizeString(s));
  if (!timestamp) return null;

  // 1. 元号をセット
  const yearLabelValue = String(Number(timestamp.date.yearLabel.code) + 231);
  const eraEl = setSelectValue("ddlJudEra", yearLabelValue);
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

  // 5. 「日指定」モードに
  const modeEl = setSelectValue("ddlJudDateRestriction", "exact date");
  if (!modeEl) return null;

  return timestamp;
};

export const pasteDateField = (clipboardText: string): boolean =>
  fillDateFields(clipboardText) !== null;

/**
 * 事件番号欄を埋める
 */
const fillCaseNumber = (s: string): boolean => {
  const caseNumber = parseCaseNumber(sanitizeString(s));
  if (!caseNumber) return false;

  // 1. 元号をセット
  const yearLabelValue = (() => {
    const yearLabel = caseNumber.yearLabel.text;
    if (yearLabel === "R") return "令";
    if (yearLabel === "H") return "平";
    if (yearLabel === "S") return "昭";
    if (yearLabel === "T") return "大";
    if (yearLabel === "M") return "明";
    return yearLabel.slice(0, 1);
  })();
  const eraEl = setSelectValue("ddlCaseNumEra", yearLabelValue);
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
  if (!clearInput()) return false;
  if (fillCaseNumber(clipboardText)) {
    return pressSubmitButton();
  }
  return false;
};

const fillFreewords = (freewords: string[]): boolean => {
  const el = document.getElementById("ft") as HTMLInputElement;
  el.value = freewords.filter(Boolean).join(" ").trim();
  return 0 < el.value.length;
};

export const focusFreeWord = (): boolean => {
  const el = document.getElementById("ft") as HTMLInputElement;
  el.select();
  return true;
};

/**
 * WLJPのIDを取得できればフリーワード欄に入力
 */
const fillWljpId = (s: string): boolean => {
  const m = /[0-9]{4}WLJPCA[0-9]{8}/.exec(sanitizeString(s));
  if (!m) return false;
  const [t] = m;
  return fillFreewords([t]);
};

export const pasteWljpId = (clipboardText: string): boolean => {
  if (!clearInput()) return false;
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
  const fields = s.split("\t").map(sanitizeString);
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
export const pasteAndSearch = (clipboardText: string): boolean => {
  if (!clearInput()) return false;
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
    "https://go.westlawjapan.com/wljp/app/search/template?tid=wljpCasesSearchTemplate&amp;bcp=1";
  return true;
};

export const pressSubmitButton = (): boolean => {
  document.getElementById("submitSearch")?.click();
  return true;
};

export const clearInput = (): boolean => {
  Array.from(document.getElementsByTagName("input")).forEach((elem) => {
    if (elem.getAttribute("type") === "text") {
      elem.value = "";
    }
  });

  Array.from(document.getElementsByTagName("select")).forEach((elem) => {
    elem.selectedIndex = -1;
  });

  return true;
};

/**
 * 要旨欄の内容を取得する
 * */
const getAnchorHeadDetail = (label: string): string => {
  const [target] = Array.from(
    document.querySelectorAll("#anchor-case-head span.cases-head-label"),
  ).filter((el) => {
    return el.textContent.trim() == label;
  });
  if (!target) return "";
  const textNode = target.nextSibling;
  if (!textNode) return "";
  return textNode.textContent?.trim() ?? "";
};

export const getDisplayedCaseNumber = (): string => {
  return getAnchorHeadDetail("事件番号")
    .split("・")
    .map((w) => {
      return w
        .trim()
        .replaceAll("（", "年（")
        .replaceAll("）", "）第")
        .replace(/^./, (c) => YEAR_LABEL_ABBREV_TO_FULL.get(c) ?? c);
    })
    .map((w) => w.replaceAll("元年", "１年"))
    .join("、");
};

export const copyCaseNumber = (): boolean => {
  const c = getDisplayedCaseNumber();
  if (c) {
    copyString(document, c);
    return true;
  }
  return false;
};

export const getDisplayedWljpId = (): string => getAnchorHeadDetail("文献番号");

export const copyWljpId = (): boolean => {
  const wljpId = getDisplayedWljpId();
  if (wljpId) {
    copyString(document, wljpId);
    return true;
  }
  return false;
};

const getDisplayedDate = (): string => {
  const t = getAnchorHeadDetail("裁判年月日");
  return (
    t.slice(0, 1) +
    t
      .slice(2)
      .replace("日", "")
      .replace(/[年月]/g, ".")
  );
};

export const copyReference = (): boolean => {
  const courtName = getAnchorHeadDetail("裁判所名").replace(/裁$/, "");
  const category = getAnchorHeadDetail("裁判区分").slice(0, 1);
  const timestamp = getDisplayedDate();
  const wid = getDisplayedWljpId();
  if (courtName && category && timestamp && wid) {
    copyString(
      document,
      `${courtName}${category}${timestamp} WestlawJapan ${wid}`,
    );
    return true;
  }
  return false;
};
