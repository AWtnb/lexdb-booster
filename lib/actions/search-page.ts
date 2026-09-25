import { deriveLeadingCourtName, expandCourtAbbrev } from "../court";
import {
  getYearCode,
  matchTimestamp,
  parseCaseNumber,
  toFullWidthDigits,
  toHalfWidth,
  type Timestamp,
} from "../text-utils";
import type { HotkeyAction, HotkeyActionWithClipboardText } from "../types";
import { setSelectBoxValue } from "../ui";

/**
 * 文字列を正規化する
 * （半角カタカナ、不要な文字の削除など）
 */
const normalize = (s: string): string => {
  return toHalfWidth(s).replace(/^\?/, "");
};

/**
 * 入力フィールドをすべてクリアする
 */
export const clearAllInputBox: HotkeyAction = ({ bodyDocument }): boolean => {
  (
    bodyDocument.getElementById(
      "InputHanketuYMD_Control_HanketuSubeteRadioButton",
    ) as HTMLInputElement
  ).click();
  (
    bodyDocument.getElementById(
      "InputJikenBangou_Control_JikenBangou_DropDownList",
    ) as HTMLSelectElement
  ).value = "";

  Array.from(bodyDocument.getElementsByTagName("input")).forEach((elem) => {
    if (elem.getAttribute("type") === "text") {
      elem.value = "";
    } else if (elem.getAttribute("type") === "checkbox") {
      elem.checked = false;
    }
  });
  return true;
};

/**
 * 「検索開始」ボタンを押す
 */
export const pressSubmitButton: HotkeyAction = ({
  headWindow,
  url,
}): boolean => {
  if (url.pathname.endsWith("SearchAll.aspx")) {
    headWindow.SubmitSearchBottom?.("search", "_parent");
    return true;
  }
  return false;
};

/**
 * 事件番号欄を埋める
 */
const fillCaseNumber = (doc: Document, s: string): boolean => {
  const reg = new RegExp(
    "(明治|大正|昭和|平成|令和)([0-9]{1,2}|元)年\\(.{1,3}\\)第[0-9]+号",
  );
  const m = reg.exec(normalize(s));
  if (!m) return false;
  const top = s.slice(m.index);
  const caseNumber = parseCaseNumber(top);
  if (!caseNumber) return false;
  const { code, year, sign, num } = caseNumber;

  setSelectBoxValue(
    doc,
    "InputJikenBangou_Control_JikenBangou_DropDownList",
    code,
  );

  [
    { id: "InputJikenBangou_Control_JikenBangouText0", value: year.toString() },
    { id: "InputJikenBangou_Control_JikenBangouText1", value: sign },
    { id: "InputJikenBangou_Control_JikenBangouText2", value: num.toString() },
  ].forEach(({ id, value }) => {
    (doc.getElementById(id) as HTMLInputElement).value = value;
  });
  return true;
};

/**
 * 事件番号貼り付け処理
 */
export const pasteCaseNumber: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb: string,
): boolean => {
  return fillCaseNumber(bodyDocument, cb);
};

/**
 * 日付欄へ入力する。
 * 入力成功した場合、Timestamp オブジェクトを返す。
 */
const fillDateFields = (doc: Document, s: string): Timestamp | null => {
  const timestamp = matchTimestamp(normalize(s));
  if (!timestamp) return null;

  (
    doc.getElementById(
      "InputHanketuYMD_Control_HanketuShiteiRadioButton",
    ) as HTMLInputElement
  ).checked = true;

  setSelectBoxValue(
    doc,
    "InputHanketuYMD_Control_NENGOU_DropDownList0",
    getYearCode(timestamp.date.label),
  );

  [
    {
      id: "InputHanketuYMD_Control_HANKETU_YEAR0",
      value: timestamp.date.year,
    },
    {
      id: "InputHanketuYMD_Control_HANKETU_MONTH0",
      value: timestamp.date.month,
    },
    {
      id: "InputHanketuYMD_Control_HANKETU_DAY0",
      value: timestamp.date.day,
    },
  ].forEach(({ id, value }) => {
    (doc.getElementById(id) as HTMLInputElement).value = String(value);
  });

  return timestamp;
};

/**
 * 日付貼り付け処理
 */
export const pasteDate: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb,
): boolean => {
  return fillDateFields(bodyDocument, cb) !== null;
};

const FREEWORD_IDS = [
  "InputFreeKeyword_Control_KEYWORD00",
  "InputFreeKeyword_Control_KEYWORD05",
  "InputFreeKeyword_Control_KEYWORD10",
  "InputFreeKeyword_Control_KEYWORD15",
  "InputFreeKeyword_Control_KEYWORD20",
];

/**
 * フリーワードの最後の入力済み欄にフォーカスする
 */
export const focusFreeWord: HotkeyAction = ({ bodyDocument }): boolean => {
  const filledInputIds = FREEWORD_IDS.filter((id) => {
    const elem = bodyDocument.getElementById(id) as HTMLInputElement;
    return elem.value !== "";
  });

  const target = filledInputIds.pop() ?? FREEWORD_IDS[0]!;
  (bodyDocument.getElementById(target) as HTMLInputElement).select();
  return true;
};

/**
 * フリーワードのAND欄へのフォーカスをサイクルする
 */
export const cycleFreeWord: HotkeyAction = ({ bodyDocument }): boolean => {
  const activeElem = bodyDocument.activeElement;
  if (!activeElem) return false;

  const idx = FREEWORD_IDS.indexOf(activeElem.id);
  if (0 <= idx) {
    const nextIdx = (idx + 1) % FREEWORD_IDS.length;
    bodyDocument.getElementById(FREEWORD_IDS[nextIdx]!)?.focus();
    return true;
  }

  const activeId = activeElem.id;
  if (!activeId.startsWith("InputFreeKeyword_Control_KEYWORD")) {
    bodyDocument.getElementById(FREEWORD_IDS[0]!)?.focus();
    return true;
  }

  const current = parseInt(
    activeId.replace("InputFreeKeyword_Control_KEYWORD", ""),
  );

  // 現在の行の先頭インデックス（KEYWORD00=0, KEYWORD05=1, ...）を求め、次へ進める
  // 各行は5列区切りなので、Math.floorで所属行を特定
  const rowIdx = Math.floor(current / 5);
  const nextRowIdx = (rowIdx + 1) % FREEWORD_IDS.length;
  bodyDocument.getElementById(FREEWORD_IDS[nextRowIdx]!)?.focus();
  return true;
};

/**
 * LEX文献番号欄を埋める処理
 */
const fillLexId = (doc: Document, s: string): boolean => {
  const m = normalize(s).match(/\d{8}/);
  if (!m) return false;
  const lexId = m[0];
  (
    doc.getElementById("InputBunban_Control_BUNKEN00") as HTMLInputElement
  ).value = lexId;
  return true;
};

/**
 * LEX文献番号を貼り付ける処理
 */
export const pasteLexId: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb,
): boolean => {
  return fillLexId(bodyDocument, cb);
};

/** 出典の詳細欄を整形する */
const formatDetail = (detail: string): string => {
  let fmt = normalize(detail);

  // 文字列から最初の連続数字以降を抽出
  const m = fmt.match(/[0-9]+/);
  if (!m) return "";
  fmt = fmt.slice(m.index);

  // 「高刑速報（昭58）号145頁」のようなとき、括弧だけ全角にする
  const regDate = /\(([明大昭平令][0-9]{1,2})\)/;
  fmt = fmt.replace(regDate, (_, y) => `（${y}）`);

  // 「=」以前を除去する（合併号対策）
  const last = fmt.split("=").pop();
  if (last) fmt = last;

  // 2番目以降の場合は頁部分を除去する
  const regSecondPage = /[0-9]+頁[②㋺ロ](事件)?/;
  fmt = fmt.replace(regSecondPage, "");

  return toFullWidthDigits(fmt);
};

/**
 * フリーワード欄を埋める
 */
const fillFreewords = (doc: Document, words: string[]): void => {
  for (const [i, id] of FREEWORD_IDS.entries()) {
    const elem = doc.getElementById(id) as HTMLInputElement;
    elem.value = words[i] ?? "";
  }
};

const SMOOTH_CSV_COL = {
  COURT: 4,
  DATE: 6,
  DETAIL: 8,
  CASE_NUMBER: 9,
} as const;

/**
 * 事件番号調査用のCSVから一括貼り付け
 * SmoothCSVからのコピーを前提に、列はタブ区切りで扱う
 */
export const pasteSmoothCsv: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb,
): boolean => {
  const line = toHalfWidth(cb);
  const fields = line.split("\t").map((t) => (t.startsWith("?") ? "" : t));
  const court = fields[SMOOTH_CSV_COL.COURT]!;
  const date = fields[SMOOTH_CSV_COL.DATE]!;
  const detail = fields[SMOOTH_CSV_COL.DETAIL]!;
  const casenumber = fields[SMOOTH_CSV_COL.CASE_NUMBER]!;

  if (fillLexId(bodyDocument, detail)) {
    return true;
  }

  if (fillCaseNumber(bodyDocument, casenumber)) {
    return true;
  }

  if (!fillDateFields(bodyDocument, date)) {
    return false;
  }

  const freewords = [];
  const courtExpanded = expandCourtAbbrev(court);
  if (courtExpanded) freewords.push(courtExpanded);
  freewords.push(formatDetail(detail));

  fillFreewords(bodyDocument, freewords);
  return true;
};

/**
 * 判例文字列からの貼り付け
 * 例：「札幌地判令和3・3・17判時2487号3頁」
 */
export const pastePrecedent: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb,
): boolean => {
  const s = normalize(cb.replace(/\s/g, "").replace(/[\r\n]+/g, ""));
  if (s.match(/lex\/db/i) && fillLexId(bodyDocument, s)) {
    return true;
  }

  const caseNumberFillResult = fillCaseNumber(bodyDocument, s);
  const filledTimestamp = fillDateFields(bodyDocument, s);

  const freewords = [];

  const courtName = deriveLeadingCourtName(s);
  if (courtName) freewords.push(courtName);

  if (filledTimestamp) {
    const detail = formatDetail(s.slice(filledTimestamp.end));
    if (detail) freewords.push(detail);
  }
  fillFreewords(bodyDocument, freewords);

  return (
    caseNumberFillResult || filledTimestamp !== null || 0 < freewords.length
  );
};
