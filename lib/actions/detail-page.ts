import { abbreviateCourtName } from "../court";
import { toHalfWidth } from "../text-utils";
import type { HotkeyAction } from "../types";
import { copyString } from "../ui";

/**
 * 事件番号取得処理
 */
const getDisplayedCaseNumber = (doc: Document): string => {
  const caseNumbers: string[] = [];
  const trs = Array.from(doc.querySelectorAll<HTMLElement>("tbody tr"));
  let collecting = false;

  for (const tr of trs) {
    const td1 = tr.firstElementChild;
    if (!td1) continue;

    const label = td1.textContent?.trim() ?? "";

    if (!collecting) {
      if (label !== "【事件番号】") continue;
      collecting = true;
    } else if (label !== "") {
      break;
    }

    const td2 = td1.nextElementSibling;
    const value = td2?.textContent?.trim() ?? "";
    if (value) caseNumbers.push(value);
  }

  return caseNumbers.join("、");
};

const getRowValue = (doc: Document, header: string): string => {
  const rows = Array.from(
    doc.querySelectorAll<HTMLElement>(".ContentsShow tbody tr"),
  );
  for (const row of rows) {
    const cells = Array.from(row.getElementsByTagName("td"));
    const rowHeader = cells[0]!.innerText.trim();
    if (rowHeader === header) {
      return cells[1]?.innerText.trim() || "";
    }
  }
  return "";
};

/**
 * 文献番号取得処理
 */
const getDisplayedLexID = (doc: Document): string => {
  return toHalfWidth(getRowValue(doc, "【文献番号】"));
};

const MAJOR_CATEGORY_MAPPING: Record<string, string> = {
  中間判決: "中間判",
  執行処分: "執行処分",
  裁定: "裁定",
  裁決: "裁決",
  調停: "調停",
  審判: "審",
  決定: "決",
  判決: "判",
  命令: "命令",
  審決: "審決",
  略式命令: "略式命令",
} as const;

/**
 * 裁判所名+種別取得処理
 */
const getCourtDesicion = (doc: Document): string => {
  const [category, courtName] = toHalfWidth(getRowValue(doc, "【文献種別】"))
    .replace(/\(.+?\)/, "")
    .split("/");
  if (!category || !courtName) return "";
  console.log(courtName);
  return `${abbreviateCourtName(courtName)}${MAJOR_CATEGORY_MAPPING[category] || ""}`;
};

/**
 * 日付取得処理
 */
const getTimestamp = (doc: Document): string => {
  const timestamp = toHalfWidth(getRowValue(doc, "【裁判年月日】"))
    .replace(/\s/g, "")
    .replace("年", "・")
    .replace("月", "・")
    .replace("日", "");
  return `${timestamp.substring(0, 1)}${timestamp.substring(2)}`;
};

export const copyCaseNumber: HotkeyAction = ({ bodyDocument }): boolean => {
  const caseNum = getDisplayedCaseNumber(bodyDocument);
  if (caseNum) {
    copyString(bodyDocument, caseNum);
    return true;
  }
  const lexID = getDisplayedLexID(bodyDocument);
  if (lexID) {
    copyString(bodyDocument, `事件番号なし。LEX/DB ${lexID}`);
    return true;
  }
  return false;
};

export const copyReference: HotkeyAction = ({ bodyDocument }): boolean => {
  const lexID = getDisplayedLexID(bodyDocument);
  if (lexID) {
    copyString(bodyDocument, `LEX/DB ${lexID}`);
    return true;
  }
  return false;
};

export const copyReferenceTsv: HotkeyAction = ({ bodyDocument }): boolean => {
  const lexID = getDisplayedLexID(bodyDocument);
  const caseNum = getDisplayedCaseNumber(bodyDocument);
  if (lexID) {
    copyString(bodyDocument, `LEX/DB\t${lexID}\t${caseNum}`);
    return true;
  }
  return false;
};

export const copyReferenceId: HotkeyAction = ({ bodyDocument }): boolean => {
  const lexID = getDisplayedLexID(bodyDocument);
  if (lexID) {
    copyString(bodyDocument, lexID);
    return true;
  }
  return false;
};

export const copyFullReference: HotkeyAction = ({ bodyDocument }): boolean => {
  const lexID = getDisplayedLexID(bodyDocument);
  if (lexID) {
    copyString(
      bodyDocument,
      `${getCourtDesicion(bodyDocument)}${getTimestamp(bodyDocument)}LEX/DB${lexID}`,
    );
    return true;
  }
  return false;
};

export const gotoZenbun: HotkeyAction = ({ headDocument }): boolean => {
  const l = headDocument.getElementById("ShowZenbunHyperLink");
  if (l) {
    l.click();
    return true;
  }
  return false;
};

export const gotoSearchResults: HotkeyAction = ({ headDocument }): boolean => {
  const l = headDocument.getElementById("ResultHyperLink");
  if (l) {
    l.click();
    return true;
  }
  return false;
};
