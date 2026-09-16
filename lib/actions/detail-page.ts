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

/**
 * 文献番号取得処理
 */
const getDisplayedLexID = (doc: Document): string => {
  const rows = Array.from(
    doc.querySelectorAll<HTMLElement>(".ContentsShow tbody tr"),
  );
  for (const row of rows) {
    const cells = Array.from(row.getElementsByTagName("td"));
    const rowHeader = cells[0]!.innerText.trim();
    if (rowHeader === "【文献番号】") {
      return toHalfWidth(cells[1]?.innerText.trim() || "");
    }
  }
  return "";
};

export const copyCaseNumber: HotkeyAction = ({ bodyDocument }): void => {
  const caseNum = getDisplayedCaseNumber(bodyDocument);
  if (caseNum) {
    copyString(bodyDocument, caseNum);
    return;
  }
  const lexID = getDisplayedLexID(bodyDocument);
  copyString(bodyDocument, `事件番号なし。LEX/DB ${lexID}`);
};

export const copyReference: HotkeyAction = ({ bodyDocument }): void => {
  const lexID = getDisplayedLexID(bodyDocument);
  if (lexID) copyString(bodyDocument, `LEX/DB ${lexID}`);
};

export const copyReferenceTsv: HotkeyAction = ({ bodyDocument }): void => {
  const lexID = getDisplayedLexID(bodyDocument);
  const caseNum = getDisplayedCaseNumber(bodyDocument);
  if (lexID) copyString(bodyDocument, `LEX/DB\t${lexID}\t${caseNum}`);
};

export const copyReferenceId: HotkeyAction = ({ bodyDocument }): void => {
  const lexID = getDisplayedLexID(bodyDocument);
  if (lexID) copyString(bodyDocument, lexID);
};

export const copyFullReference: HotkeyAction = ({ bodyDocument }): void => {
  const lexID = getDisplayedLexID(bodyDocument);
  if (lexID) copyString(bodyDocument, `LEX/DB ${lexID}`); // TODO: 裁判所名と日付も入れる
};

export const gotoZenbun: HotkeyAction = ({ headDocument }): void => {
  const l = headDocument.getElementById("ShowZenbunHyperLink");
  if (l) l.click();
};

export const gotoSearchResults: HotkeyAction = ({ headDocument }): void => {
  const l = headDocument.getElementById("ResultHyperLink");
  if (l) l.click();
};
