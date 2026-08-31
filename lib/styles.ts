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

/** 見出しテキストと背景色の対応表 */
const HEADING_BACKGROUND_MAP: Record<string, string> = {
  "【事件番号】": "salmon",
  "【掲載文献】": "plum",
  "【備考】": "silver",
  "【裁判年月日】": "gold",
};

/**
 * 先頭に移動する見出しグループの定義
 * mapの順序 = テーブル先頭への挿入順
 */
const REORDER_HEADINGS = ["【事件番号】", "【掲載文献】", "【備考】"] as const;

/**
 * 詳細ページのスタイル適用
 * 【事件番号】【掲載文献】【備考】を色分けしつつ、テーブル先頭に並び替える
 */
export const applyDetailPageStyles = (doc: Document): void => {
  const table = doc.querySelector("table");
  if (!table) return;

  let background = "inherit";
  const reorderRowsMap = new Map<string, HTMLTableRowElement[]>(
    REORDER_HEADINGS.map((h) => [h, []]),
  );

  Array.from(doc.getElementsByTagName("td")).forEach((elem) => {
    elem.style.fontFamily = "'UDEV Gothic', HackGen";
    elem.style.lineHeight = "1.5";

    const text = elem.innerText;

    if (text.startsWith("【")) {
      background = HEADING_BACKGROUND_MAP[text] ?? "inherit";

      if (reorderRowsMap.has(text)) {
        reorderRowsMap.set(text, collectFollowingRows(elem));
      }
    }

    const nextCell = elem.nextElementSibling as HTMLElement | null;
    if (nextCell) {
      nextCell.style.background = background;
    }
  });

  // 【事件番号】【掲載文献】【備考】の行をテーブルの先頭に移動
  const tbody = table.querySelector("tbody") ?? table;
  const firstRow = tbody.querySelector("tr");

  REORDER_HEADINGS.forEach((heading) => {
    reorderRowsMap.get(heading)?.forEach((row) => {
      tbody.insertBefore(row, firstRow);
    });
  });
};
