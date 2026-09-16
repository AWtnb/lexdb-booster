import { toHalfWidth } from "../text-utils";
import { copyString } from "../ui";

/**
 * 事件番号取得処理
 */
export const getDisplayedCaseNumber = (doc: Document): string => {
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
export const getDisplayedLexID = (doc: Document): string => {
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

export const copyCaseNumber = (doc: Document): void => {
  const caseNum = getDisplayedCaseNumber(doc);
  if (caseNum) {
    copyString(doc, caseNum);
    return;
  }
  const lexID = getDisplayedLexID(doc);
  copyString(doc, `事件番号なし。LEX/DB ${lexID}`);
};

export const copyReference = (doc: Document): void => {
  const lexID = getDisplayedLexID(doc);
  if (lexID) copyString(doc, `LEX/DB ${lexID}`);
};

export const copyReferenceTsv = (doc: Document): void => {
  const lexID = getDisplayedLexID(doc);
  const caseNum = getDisplayedCaseNumber(doc);
  if (lexID) copyString(doc, `LEX/DB\t${lexID}\t${caseNum}`);
};

export const copyReferenceId = (doc: Document): void => {
  const lexID = getDisplayedLexID(doc);
  if (lexID) copyString(doc, lexID);
};

export const copyFullReference = (doc: Document): void => {
  const lexID = getDisplayedLexID(doc);
  if (lexID) copyString(doc, `LEX/DB ${lexID}`); // TODO: 裁判所名と日付も入れる
};

export const gotoZenbun = (doc: Document): void => {
  const l = doc.getElementById("ShowZenbunHyperLink");
  if (l) l.click();
};

export const gotoSearchResults = (doc: Document): void => {
  const l = doc.getElementById("ResultHyperLink");
  if (l) l.click();
};
