import { copyString } from "@/lib/copy";
import {
  parseCaseNumber,
  sanitizeString,
  toHalfWidth,
  YEAR_LABEL_SOURCE,
} from "@/lib/text-utils";

export const goHome = (): boolean => {
  const wnd = window.top ?? window;
  const el = wnd.document.getElementById(
    "search-form",
  ) as HTMLFormElement | null;
  if (!el) return false;
  el.submit();
  return true;
};

export const pressSubmitButton = (): boolean => {
  const el = document.getElementById("searchbtn");
  if (!el) return false;
  el.click();
  return true;
};

export const pressClearButton = (): boolean => {
  const el = document.getElementById("all_clearbtn");
  if (!el) return false;
  el.click();
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
  if (!pressClearButton()) return false;
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
  if (!pressClearButton()) return false;
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

export const getDisplayedCaseNumber = (): string => {
  const t = getDetail("【事件番号】");
  if (!t) return "";
  const [cn] = t.split("／").slice(1);
  if (!cn) return "";
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
