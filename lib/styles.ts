/**
 * 検索結果ページのスタイル適用
 */
export const applySearchResultPageStyles = (doc: Document): void => {
  Array.from(doc.getElementsByTagName("td")).forEach((elem) => {
    elem.style.fontFamily = "'UDEV Gothic', HackGen";
    if (elem.classList.contains("ListLow3")) {
      elem.style.background = "gold";
      Array.from(elem.children).forEach((child) => {
        if (child.tagName === "FONT") {
          child.setAttribute("size", "");
        }
      });
      elem.style.fontSize = "14px";
    }
  });
};

/**
 * 【事件番号】【掲載文献】【備考】に続く行を収集する
 * elemが見出しセルであることを前提に、次の行の1列目が
 * 空文字か「【」始まりでない間は同グループとみなして集める
 */
const collectFollowingRows = (elem: HTMLElement): HTMLTableRowElement[] => {
  const rows: HTMLTableRowElement[] = [];
  let currentRow = elem.closest("tr");

  while (currentRow) {
    rows.push(currentRow as HTMLTableRowElement);
    const nextRow = currentRow.nextElementSibling as HTMLTableRowElement | null;
    if (!nextRow) break;

    const firstCell = nextRow.querySelector("td");
    const continues =
      firstCell &&
      (firstCell.innerText === "" || !firstCell.innerText.startsWith("【"));
    if (!continues) break;

    currentRow = nextRow;
  }

  return rows;
};

/**
 * 詳細ページのスタイル適用
 * 【事件番号】【掲載文献】【備考】を色分けしつつ、テーブル先頭に並び替える
 */
export const applyDetailPageStyles = (doc: Document): void => {
  const table = doc.querySelector("table");
  if (!table) return;

  let background = "inherit";
  let referenceRows: HTMLTableRowElement[] = [];
  let caseNumberRows: HTMLTableRowElement[] = [];
  let memoRows: HTMLTableRowElement[] = [];

  Array.from(doc.getElementsByTagName("td")).forEach((elem) => {
    elem.style.fontFamily = "'UDEV Gothic', HackGen";
    elem.style.lineHeight = "1.5";

    if (elem.innerText === "【事件番号】") {
      background = "salmon";
      caseNumberRows = collectFollowingRows(elem);
    } else if (elem.innerText === "【掲載文献】") {
      background = "plum";
      referenceRows = collectFollowingRows(elem);
    } else if (elem.innerText === "【備考】") {
      background = "silver";
      memoRows = collectFollowingRows(elem);
    } else if (elem.innerText === "【裁判年月日】") {
      background = "gold";
    } else if (elem.innerText.startsWith("【")) {
      background = "inherit";
    }

    const target = elem.nextElementSibling as HTMLElement | null;
    if (target) {
      target.style.background = background;
    }
  });

  // 【事件番号】【掲載文献】【備考】の行をテーブルの先頭に移動
  const tbody = table.querySelector("tbody") || table;
  const firstRow = tbody.querySelector("tr");

  [caseNumberRows, referenceRows, memoRows].forEach((rows) => {
    if (0 < rows.length) {
      rows.forEach((row) => {
        tbody.insertBefore(row, firstRow);
      });
    }
  });
};
