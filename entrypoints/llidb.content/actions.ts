import { copyString } from "@/lib/copy";
import {
  deriveLeadingCourtName,
  expandCourtAbbrev,
  formatCourtName,
} from "@/lib/court";
import {
  formatDetail,
  matchTimestamp,
  parseCaseNumber,
  sanitizeString,
  SMOOTH_CSV_COL,
  toHalfWidth,
  YEAR_LABEL_SOURCE,
  type Timestamp,
} from "@/lib/text-utils";

export const goHome = (): boolean => {
  const wnd = window.top ?? window;
  const el = wnd.document.getElementById("search-form") as HTMLFormElement;
  el.submit();
  return true;
};

export const pressSubmitButton = (): boolean => {
  const el = document.getElementById("searchbtn");
  if (!el) return false;
  el.click();
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

const fillLliId = (s: string): boolean => {
  const [el] = document.getElementsByName("LIC_NO");
  if (!el) return false;

  const m = /L[0-9]{8}/.exec(sanitizeString(s));
  if (!m) return false;
  const [t] = m;

  (el as HTMLInputElement).value = t;
  return true;
};

export const pasteLliId = (clipboardText: string): boolean => {
  if (!clearInput()) return false;
  if (fillLliId(clipboardText)) {
    return pressSubmitButton();
  }
  return false;
};

/**
 * 年号コードから元号選択ボックスのvalue（アルファベット1文字）に変換するマップ
 */
const YEAR_CODE_TO_LABEL_ALPHABET = new Map<string, string>(
  YEAR_LABEL_SOURCE.map(({ code, labels }) => [code, labels[2]] as const),
);

const fillCaseNumber = (s: string): boolean => {
  const caseNumber = parseCaseNumber(sanitizeString(s));
  if (!caseNumber) return false;

  // 1. 元号をセット
  const eraValue = YEAR_CODE_TO_LABEL_ALPHABET.get(caseNumber.code);
  if (!eraValue) return false;

  const [eraEl] = document.getElementsByName("CN1");
  if (!eraEl) return false;
  (eraEl as HTMLSelectElement).value = eraValue;

  // 2. 年をセット
  const [yearEl] = document.getElementsByName("CN2");
  if (!yearEl) return false;
  (yearEl as HTMLSelectElement).value = String(caseNumber.year);

  // 3. 符号・事件番号をセット
  const [signEl] = document.getElementsByName("CN3");
  if (!signEl) return false;
  (signEl as HTMLSelectElement).value = String(caseNumber.sign);

  const [numEl] = document.getElementsByName("CN4");
  if (!numEl) return false;
  (numEl as HTMLSelectElement).value = String(caseNumber.num);

  return true;
};

export const pasteCaseNumber = (clipboardText: string): boolean => {
  if (!clearInput()) return false;
  if (fillCaseNumber(clipboardText)) {
    return pressSubmitButton();
  }
  return false;
};

/**
 * 詳細ページでiframeで挿入されたdocumentを取得する
 */
const getFrameDocument = (): Document | null => {
  if (window !== window.top) {
    return window.document;
  }
  const docFrame = document.getElementById(
    "doc_frame",
  ) as HTMLIFrameElement | null;
  return docFrame?.contentWindow?.document ?? null;
};

const getDetail = (header: string): string => {
  const doc = getFrameDocument();
  if (!doc) return "";
  const tags = Array.from(doc.querySelectorAll(".gaiyou_tag"));
  for (const tag of tags) {
    if (tag.textContent.trim() !== header) continue;
    const el = tag.nextElementSibling;
    if (el) {
      return el.textContent.trim();
    }
  }
  return "";
};

const styleUpRow = (header: string, color: string) => {
  const doc = getFrameDocument();
  if (!doc) return "";

  const tags = Array.from(doc.querySelectorAll(".gaiyou_tag"));

  let inMagazineSection = false;

  for (const tag of tags) {
    const text = tag.textContent?.trim();

    if (text === header) {
      inMagazineSection = true;
    } else if (text?.startsWith("【") && text?.endsWith("】")) {
      inMagazineSection = false;
    }

    if (!inMagazineSection) continue;

    const row = tag.closest("tr");
    if (!row) continue;
    row.style.backgroundColor = color;
  }
};

export const styleUpSource = () => {
  styleUpRow("【判決日付】", "gold");
  styleUpRow("【事件番号】", "salmon");
  styleUpRow("【掲載誌】", "plum");
};

export const getDisplayedCaseNumber = (): string => {
  const t = getDetail("【事件番号】");
  if (!t) return "";
  const [cn] = t.split("／").slice(1);

  if (!cn) {
    const lid = getDisplayedLliId();
    if (!lid) return "";
    return `事件番号なし（LLI/DB ${lid}）`;
  }
  return cn.replace("元年", "１年");
};

export const copyCaseNumber = (): boolean => {
  const doc = getFrameDocument();
  if (!doc) return false;
  const c = getDisplayedCaseNumber();
  if (c) {
    copyString(doc, c);
    return true;
  }
  return false;
};

export const getDisplayedLliId = (): string => {
  return toHalfWidth(getDetail("【判例番号】"));
};

export const copyLliId = (): boolean => {
  const doc = getFrameDocument();
  if (!doc) return false;
  const lid = getDisplayedLliId();
  if (lid) {
    copyString(doc, lid);
    return true;
  }
  return false;
};

const extractCategory = (base: string, after: string): string | null => {
  const i = base.indexOf(after);
  if (i < 0) return null;
  const [category] = base.slice(i + after.length).slice(0, 1);
  return category ?? null;
};

const parseCourtDecision = (
  s: string,
): { abbrev: string | null; category: string | null } => {
  if (s.includes("最高裁判所")) {
    const mapping = new Map<string, string>([
      ["大法廷", "最大"],
      ["第１小法廷", "最一小"],
      ["第２小法廷", "最二小"],
      ["第３小法廷", "最三小"],
    ]);
    for (const [phrase, abbrev] of mapping) {
      if (s.includes(phrase)) {
        return {
          abbrev,
          category: extractCategory(s, phrase),
        };
      }
    }
    return { abbrev: "最", category: extractCategory(s, "最高裁判所") };
  }
  const phrases = ["高等裁判所", "家庭裁判所", "地方裁判所"];
  for (const phrase of phrases) {
    if (!s.includes(phrase)) continue;
    const [prefix, suffix] = s.split(phrase);
    if (!prefix || !suffix) continue;
    let abbrev = prefix + phrase.slice(0, 1);
    const i = suffix.indexOf("支部");
    if (i !== -1) {
      abbrev = abbrev + suffix.slice(0, i + 1);
      return { abbrev, category: extractCategory(s, "支部") };
    }
    return { abbrev, category: extractCategory(s, phrase) };
  }
  return { abbrev: null, category: null };
};

export const copyReference = (): boolean => {
  const [decision] = getDetail("【事件番号】").split("／");
  if (!decision) return false;
  const { abbrev, category } = parseCourtDecision(decision);
  if (!abbrev || !category) return false;
  const timestamp = toHalfWidth(getDetail("【判決日付】"))
    .replace(/[年月]/g, ".")
    .replace("日", "")
    .replace(/^(.)./, "$1");
  const lid = getDisplayedLliId();
  if (!lid) return false;
  const ref = `${abbrev}${category}${timestamp} LLI/DB ${lid}`;
  const doc = getFrameDocument();
  if (!doc) return false;
  copyString(doc, ref);
  return true;
};

/**
 * 年号1文字目から元号選択ボックスのvalue（アルファベット1文字）に変換するマップ
 */
const YEAR_LABEL_ABBREV_TO_ALPHABET = new Map<string, string>(
  YEAR_LABEL_SOURCE.map(({ labels }) => [labels[1], labels[2]] as const),
);

/**
 * 日付欄を埋める
 */
const fillDateFields = (s: string): Timestamp | null => {
  const timestamp = matchTimestamp(sanitizeString(s));
  if (!timestamp) return null;

  const yearLabelValue = YEAR_LABEL_ABBREV_TO_ALPHABET.get(
    timestamp.date.label.slice(0, 1),
  );
  if (!yearLabelValue) return null;

  // 1. 元号をセット
  const labelEl = document.querySelector(
    "select.cmb_date1",
  ) as HTMLSelectElement;
  labelEl.value = yearLabelValue;

  // 2. 年をセット
  const yearEl = document.getElementsByName("T12")[0] as HTMLInputElement;
  yearEl.value = String(timestamp.date.year);

  // 3. 月をセット
  const monthEl = document.getElementsByName("T13")[0] as HTMLInputElement;
  monthEl.value = String(timestamp.date.month);

  // 4. 日をセット
  const dayEl = document.getElementsByName("T14")[0] as HTMLInputElement;
  dayEl.value = String(timestamp.date.day);

  return timestamp;
};

export const pasteDateField = (clipboardText: string): boolean =>
  fillDateFields(clipboardText) !== null;

/**
 *  「任意語」欄のANDを埋めていく
 * */
const fillFreewords = (freewords: string[]): boolean => {
  const ids = ["0-0", "1-0", "2-0", "3-0", "4-0", "5-0"];
  ids.forEach((elemId, i) => {
    const elem = document.getElementById(elemId) as HTMLInputElement;
    elem.value = freewords[i] ?? "";
  });
  return ids.some((elemId) => {
    const elem = document.getElementById(elemId) as HTMLInputElement;
    return elem.value;
  });
};

/**
 * 判例文字列からの貼り付け
 * 例：「札幌地判令和3・3・17判時2487号3頁」
 */
const pastePrecedent = (s: string): boolean => {
  if (fillLliId(s)) {
    return true;
  }
  const caseNumberFillResult = fillCaseNumber(s);
  const filledTimestamp = fillDateFields(s);

  const freewords = [];

  const courtName = deriveLeadingCourtName(s);
  if (courtName) freewords.push(formatCourtName(courtName));

  if (!caseNumberFillResult && filledTimestamp) {
    const detail = s.slice(filledTimestamp.end);
    freewords.push(formatDetail(detail));
  }
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

  if (fillLliId(detail)) {
    return true;
  }

  if (fillCaseNumber(casenumber)) {
    return true;
  }

  const freewords = [];
  const courtExpanded = expandCourtAbbrev(court);
  if (courtExpanded) freewords.push(formatCourtName(courtExpanded));
  freewords.push(formatDetail(detail));

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
