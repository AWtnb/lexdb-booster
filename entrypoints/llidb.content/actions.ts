import { copyString } from "@/lib/copy";
import {
  normalize,
  parseCaseNumber,
  YEAR_LABEL_SOURCE,
} from "@/lib/text-utils";

export const goHome = (): boolean => {
  const el = document.getElementById("search-form") as HTMLFormElement | null;
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

  const m = /L[0-9]{8}/.exec(normalize(s));
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
  const caseNumber = parseCaseNumber(normalize(s));
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

const getDocFormDataValue = (attr: string): string => {
  const el = document.getElementById("doc_form");
  if (!el) return "";
  const target = el.querySelector(`[${attr}]`);
  if (!target) return "";
  return target.getAttribute(attr) ?? "";
};

export const getDisplayedCaseNumber = (): string => {
  return getDocFormDataValue("data-case-number").replace("元年", "１年");
};

export const copyCaseNumber = (): boolean => {
  const c = getDisplayedCaseNumber();
  if (c) {
    copyString(document, c);
    return true;
  }
  return false;
};

export const getDisplayedLliId = (): string => {
  return getDocFormDataValue("data-precedent-id");
};

export const copyLliId = (): boolean => {
  const lid = getDisplayedLliId();
  if (lid) {
    copyString(document, lid);
    return true;
  }
  return false;
};
