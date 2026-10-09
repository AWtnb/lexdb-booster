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
  toHalfWidth,
  type Timestamp,
} from "@/lib/text-utils";

export const pressClearButton = (): boolean => {
  window.scrollTo(0, 0);
  const el = document.getElementById("clearBtn") as HTMLButtonElement;
  el.click();
  return true;
};

export const pressSubmitButton = (): boolean => {
  const el = document.getElementById("searchBtn") as HTMLButtonElement;
  el.click();
  return true;
};

export const closeAlertMessage = (): boolean => {
  const button = document.querySelector(
    ".dh-floating-widget__body button.dh-event--alert-close",
  ) as HTMLButtonElement | null;
  if (!button) return false;
  button.click();
  return true;
};

const fillCaseNumber = (s: string): boolean => {
  const caseNumber = parseCaseNumber(sanitizeString(s));
  if (!caseNumber) return false;

  // 1. 元号をセット
  const eraEl = document.getElementById(
    "hanSearchIncidentGen1",
  ) as HTMLSelectElement | null;
  if (!eraEl) return false;
  eraEl.value = caseNumber.yearLabel.code;

  // 2. 年をセット
  const [yearEl] = document.getElementsByName("matterNoY");
  if (!yearEl) return false;
  (yearEl as HTMLInputElement).value = String(caseNumber.year);

  // 3. 符号・事件番号をセット
  const [signEl] = document.getElementsByName("matterNoKirokufu");
  if (!signEl) return false;
  (signEl as HTMLSelectElement).value = String(caseNumber.sign);

  const [numEl] = document.getElementsByName("matterNoNum");
  if (!numEl) return false;
  (numEl as HTMLSelectElement).value = String(caseNumber.num);

  return true;
};

export const pasteCaseNumber = (clipboardText: string): boolean => {
  if (!pressClearButton()) return false;
  if (fillCaseNumber(clipboardText)) {
    return pressSubmitButton();
  }
  return false;
};

const getDetail = (header: string): string | null => {
  const table = document.getElementById("detailBiblioInfo");
  if (!table) return null;
  const trs = table.getElementsByTagName("tr");
  for (const tr of trs) {
    const [th] = tr.getElementsByTagName("th");
    const [td] = tr.getElementsByTagName("td");
    if (!th || !td) continue;
    if (th.textContent.trim() === header) return td.textContent.trim();
  }
  return null;
};

export const getDisplayedCaseNumber = (): string => {
  const s = getDetail("裁判年月日等");
  if (!s) return "";
  const [cn] = s.split("／").filter((s) => /[０-９]+号/.exec(s));
  if (!cn) return "";
  return cn.replace(/）(?!第)/g, "）第");
};

export const copyCaseNumber = (): boolean => {
  const c = getDisplayedCaseNumber();
  if (c) {
    copyString(document, c);
    return true;
  }
  return false;
};

export const getDisplayedD1LawId = (): string => {
  return getDetail("判例ID") ?? "";
};

export const copyD1LawId = (): boolean => {
  const did = getDisplayedD1LawId();
  if (did) {
    copyString(document, did);
    return true;
  }
  return false;
};

/**
 * 日付欄を埋める
 */
const fillDateFields = (s: string): Timestamp | null => {
  const timestamp = matchTimestamp(sanitizeString(s));
  if (!timestamp) return null;

  // 1. 元号をセット
  const [labelEl] = document.getElementsByName("judgementDateFromGengo");
  if (!labelEl) return null;
  (labelEl as HTMLSelectElement).value = timestamp.date.yearLabel.code;

  // 2. 年をセット
  const [yearEl] = document.getElementsByName("judgementDateFromY");
  if (!yearEl) return null;
  (yearEl as HTMLInputElement).value = String(timestamp.date.year);

  // 3. 月をセット
  const [monthEl] = document.getElementsByName("judgementDateFromM");
  if (!monthEl) return null;
  (monthEl as HTMLInputElement).value = String(timestamp.date.month);

  // 4. 日をセット
  const [dayEl] = document.getElementsByName("judgementDateFromD");
  if (!dayEl) return null;
  (dayEl as HTMLInputElement).value = String(timestamp.date.day);

  return timestamp;
};

export const pasteDateField = (clipboardText: string): boolean =>
  fillDateFields(clipboardText) !== null;

const fillFreeword = (freewords: string[]): boolean => {
  const el = document.getElementById("hanSearchFreeWord1_input");
  if (!el) return false;
  const q = freewords.join(" ");
  (el as HTMLInputElement).value = q;
  return 0 < q.trim().length;
};

export const focusFreeword = (): boolean => {
  const el = document.getElementById("hanSearchFreeWord1_input");
  if (!el) return false;
  (el as HTMLInputElement).select();
  return true;
};

const fillD1LawId = (s: string): boolean => {
  const m = /[0-9]{8}/.exec(sanitizeString(s));
  if (!m) return false;
  return fillFreeword(m);
};

export const pasteD1LawId = (clipboardText: string): boolean => {
  if (!pressClearButton()) return false;
  if (fillD1LawId(clipboardText)) {
    return pressSubmitButton();
  }
  return false;
};

/**
 * 判例文字列からの貼り付け
 * 例：「札幌地判令和3・3・17判時2487号3頁」
 */
const pastePrecedent = (s: string): boolean => {
  if (fillD1LawId(s)) {
    return true;
  }
  const caseNumberFillResult = fillCaseNumber(s);
  const filledTimestamp = fillDateFields(s);

  const freewords = [];

  const courtName = deriveLeadingCourtName(s);
  if (courtName) freewords.push(formatCourtName(courtName));

  const freewordFillResult = fillFreeword(freewords);

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

  if (fillD1LawId(detail)) {
    return true;
  }

  if (fillCaseNumber(casenumber)) {
    return true;
  }

  const freewords = [];
  const courtExpanded = expandCourtAbbrev(court);
  if (courtExpanded) freewords.push(formatCourtName(courtExpanded));

  const dateFillResult = fillDateFields(date) !== null;
  const freewordFillResult = fillFreeword(freewords);
  return dateFillResult || freewordFillResult;
};

/**
 * タブ区切りの文字列であれば、SmoothCSVの貼り付け処理を行い、
 * そうでなければ判例文字列の貼り付け処理を行う
 */
export const pasteAndSearch = (clipboardText: string): boolean => {
  if (!pressClearButton()) return false;
  const result = (() => {
    if (10 <= clipboardText.split("\t").length) {
      return pasteSmoothCsv(clipboardText);
    }
    return pastePrecedent(clipboardText);
  })();
  if (!result) return false;
  return pressSubmitButton();
};

const parseGreatCourtAbbrev = (base: string): string | null => {
  const detail = getDetail("裁判年月日等");
  if (!detail) return null;
  const parts = toHalfWidth(detail).split("/");
  const i = parts.indexOf("大審院");
  if (i === -1) return null;
  const branchCandidate = parts[i + 1];
  if (!branchCandidate) return null;
  const categoryAbbrev = base.slice(3, 4);
  if (branchCandidate.startsWith(categoryAbbrev)) return null;

  const mapping = new Map([
    ["連合部", "大連"],
    ["民事総連合部", "大民連"],
    ["第1民事部", "大一民"],
    ["第2民事部", "大二民"],
    ["第3民事部", "大三民"],
    ["第4民事部", "大四民"],
    ["第5民事部", "大五民"],
    ["第1第2第3刑事総連合部", "大一－三刑連"],
    ["第1第2第3第4刑事総連合部", "大一－四刑連"],
    ["刑事総連合部", "大刑連"],
    ["第1刑事部", "大一刑"],
    ["第2刑事部", "大二刑"],
    ["第3刑事部", "大三刑"],
    ["第4刑事部", "大四刑"],
    ["刑事部附帯私訴", "大刑"],
    ["第5刑事部", "大五刑"],
    ["第六刑事部", "大六刑"],
    ["民事刑事総連合部", "大民刑総連"],
    ["民事刑事連合部", "大民刑連"],
    ["休暇部", "大休暇部"],
  ]);
  return mapping.get(branchCandidate) ?? null;
};

export const copyReference = (): boolean => {
  const [pageTitle] = document.getElementsByTagName("title");
  if (!pageTitle) return false;
  let base = toHalfWidth(pageTitle.textContent.trim());
  const timestamp = matchTimestamp(base);
  if (!timestamp) return false;
  const ts = `${timestamp.date.yearLabel.text.slice(0, 1)}${timestamp.date.year}.${timestamp.date.month}.${timestamp.date.day}`;
  base = base.replace(timestamp.text, ts);
  if (base.startsWith("最高")) {
    base = "最" + base.slice(2);
  }
  if (base.startsWith("大審院")) {
    base = (parseGreatCourtAbbrev(base) ?? "大") + base.slice(3);
  }
  copyString(document, base);
  return true;
};
