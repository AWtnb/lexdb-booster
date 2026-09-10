import { toHalfWidth } from "../text-utils";

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
