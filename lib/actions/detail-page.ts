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
export const getDisplayedReferenceId = (doc: Document): string => {
  const found = Array.from(
    doc.querySelectorAll<HTMLElement>("tbody tr td:nth-child(1)"),
  )
    .map((el) => {
      if (el.innerText !== "【文献番号】") return null;
      const n = el.nextElementSibling as HTMLElement | null;
      if (n?.innerText) {
        return `LEX/DB\t${toHalfWidth(n.innerText)}`;
      }
      return null;
    })
    .filter((v): v is string => Boolean(v));

  if (0 < found.length) {
    return found[0]!;
  }
  return "";
};
