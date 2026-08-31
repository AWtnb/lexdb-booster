import { toHalfWidth } from "../text-utils";

/**
 * 事件番号取得処理
 * applyDetailPageStyles() で指定した背景色に応じて内容を取得
 */
export const getDisplayedCaseNumber = (doc: Document): string => {
  const caseNumbers = Array.from(
    doc.querySelectorAll<HTMLElement>("tbody tr td:nth-child(2)"),
  )
    .filter((el) => el.style.background === "salmon")
    .map((el) => el.innerText);

  if (caseNumbers.length) {
    return caseNumbers.join("、");
  }
  return "";
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
