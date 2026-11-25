/** 審級関係セクションの開始見出し */
const APPEAL_INSTANCE_HEADER = "【審級関係】";

/**
 * 「【審級関係】」セクションに属する行の上ボーダーを装飾する
 * 見出し行、2列目がcolspan=2の継続行、および次のセクション見出し行（終端）が対象
 */
const borderHistory = (doc: Document): void => {
  const rows = Array.from(doc.getElementsByTagName("tr"));
  const targetRowIndices: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const cells = Array.from(rows[i]!.getElementsByTagName("td"));
    const rowHeader = cells[0]!.innerText.trim();

    if (rowHeader === APPEAL_INSTANCE_HEADER) {
      targetRowIndices.push(i);
      continue;
    }
    if (targetRowIndices.length < 1) continue;

    if (cells[1]?.colSpan === 2) {
      targetRowIndices.push(i);
      continue;
    }
    if (rowHeader.startsWith("【")) {
      targetRowIndices.push(i);
      break;
    }
  }

  for (const index of targetRowIndices) {
    for (const cell of Array.from(rows[index]!.getElementsByTagName("td"))) {
      cell.style.borderTop = "1px solid gray";
    }
  }
};

/**
 * 指定ラベルに続く event-meta-content を取得する
 */
const findMetaContents = (doc: Document, label: string): HTMLElement[] => {
  const labels = doc.querySelectorAll<HTMLElement>(".event-meta-label");
  return Array.from(labels)
    .filter((el) => el.textContent?.trim() === label)
    .map((el) => el.nextElementSibling)
    .filter(
      (el): el is HTMLElement => el?.matches(".event-meta-content") ?? false,
    );
};

/**
 * 検索結果ページの審級関係欄の各列に背景色を適用する
 */
export const applySearchResultPageStyles = (doc: Document): void => {
  for (const content of findMetaContents(doc, "書誌情報")) {
    for (const cell of content.querySelectorAll<HTMLElement>(`.ColDate`)) {
      cell.style.background = "gold";
    }
  }
  for (const content of findMetaContents(doc, "審級関係")) {
    for (const cell of content.querySelectorAll<HTMLElement>(`.ColJikenNo`)) {
      cell.style.background = "salmon";
    }
  }
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
  "【文献番号】": "skyblue",
};

/**
 * 先頭に移動する見出しグループの定義
 * mapの順序 = テーブル先頭への挿入順
 */
const REORDER_HEADINGS = ["【事件番号】", "【掲載文献】", "【備考】"] as const;

/** ヘッダー行の総数（先頭のヘッダー行を含む） */
const HEADER_ROW_COUNT = 3;

/**
 * ヘッダー行群の最後の行を取得する。
 * 先頭のヘッダー行から、続く行をヘッダーと見なして辿る。
 */
const findLastHeaderRow = (doc: Document): HTMLTableRowElement | null => {
  const firstRow = doc.querySelector<HTMLTableRowElement>(
    "tr:has(> td.syoshi-table-header-cell)",
  );
  if (!firstRow) return null;

  let last = firstRow;
  for (let i = 1; i < HEADER_ROW_COUNT; i++) {
    const next = last.nextElementSibling as HTMLTableRowElement;
    if (next?.tagName !== "TR") break;
    last = next;
  }
  return last;
};

/**
 * 詳細ページのスタイル適用
 * 【事件番号】【掲載文献】【備考】を色分けしつつ、テーブル先頭に並び替える
 */
export const applyDetailPageStyles = (doc: Document): void => {
  const table = doc.querySelector("table.syoshi-table");
  if (!table) return;

  borderHistory(doc);

  let background = "inherit";
  const reorderRowsMap = new Map<string, HTMLTableRowElement[]>(
    REORDER_HEADINGS.map((h) => [h, []]),
  );

  Array.from(doc.getElementsByTagName("td")).forEach((elem) => {
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

  // 【事件番号】【掲載文献】【備考】の行をヘッダー行群の直下に移動
  const lastHeaderRow = findLastHeaderRow(doc);
  if (!lastHeaderRow) return;

  let anchor: HTMLTableRowElement = lastHeaderRow;
  REORDER_HEADINGS.forEach((heading) => {
    reorderRowsMap.get(heading)?.forEach((row) => {
      anchor.after(row);
      anchor = row;
    });
  });
};
