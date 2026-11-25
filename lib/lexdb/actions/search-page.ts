import {
  deriveLeadingCourtName,
  expandCourtAbbrev,
  formatCourtName,
} from "@/lib/court";
import {
  formatDetail,
  matchTimestamp,
  parseCaseNumber,
  sanitizeString,
  SMOOTH_CSV_COL,
  type Timestamp,
} from "@/lib/text-utils";
import type { HotkeyAction, HotkeyActionWithClipboardText } from "../types";

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
 * セレクトボックスの値を設定してchangeイベントを発火する
 */
const setSelectBoxValue = (
  doc: Document,
  elemId: string,
  value: string,
): void => {
  const selectElement = doc.getElementById(elemId) as HTMLSelectElement;
  selectElement.value = value;
  const changeEvent = new Event("change", { bubbles: true });
  selectElement.dispatchEvent(changeEvent);
};

/**
 * 事件番号欄を埋める
 */
const fillCaseNumber = (doc: Document, s: string): boolean => {
  const caseNumber = parseCaseNumber(sanitizeString(s));
  if (!caseNumber) return false;
  const { yearLabel, year, sign, num } = caseNumber;

  setSelectBoxValue(
    doc,
    "InputJikenBangou_Control_JikenBangou_DropDownList",
    yearLabel.code,
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
  cb,
): boolean => {
  return fillCaseNumber(bodyDocument, cb);
};

/**
 * 日付欄へ入力する。
 * 入力成功した場合、Timestamp オブジェクトを返す。
 */
const fillDateFields = (doc: Document, s: string): Timestamp | null => {
  const timestamp = matchTimestamp(sanitizeString(s));
  if (!timestamp) return null;

  (
    doc.getElementById(
      "InputHanketuYMD_Control_HanketuShiteiRadioButton",
    ) as HTMLInputElement
  ).checked = true;

  setSelectBoxValue(
    doc,
    "InputHanketuYMD_Control_NENGOU_DropDownList0",
    timestamp.date.yearLabel.code,
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

const FREEWORD_ID = "KeywordText";

/**
 * フリーワードの最後の入力済み欄にフォーカスする
 */
export const focusFreeWord: HotkeyAction = ({ bodyDocument }): boolean => {
  const elem = bodyDocument.getElementById(FREEWORD_ID) as HTMLInputElement;
  if (elem) {
    elem.select();
    return true;
  }
  return false;
};

/**
 * LEX文献番号欄を埋める処理
 */
const fillLexId = (doc: Document, s: string): boolean => {
  const m = sanitizeString(s).match(/\d{8}/);
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

/**
 * wordsを最大15文字に切り分ける
 */
const sliceFreewords = (words: string[]): string[] => {
  return words.flatMap((word) => {
    if (word.length <= 15) return [word];
    return Array.from({ length: Math.ceil(word.length / 15) }, (_, i) =>
      word.slice(i * 15, (i + 1) * 15),
    );
  });
};

/**
 * フリーワード欄を埋める
 */
const fillFreewords = (doc: Document, words: string[]): boolean => {
  const elem = doc.getElementById(FREEWORD_ID) as HTMLInputElement;
  if (elem) {
    elem.value = words.join(" ");
    return elem.value.trim() !== "";
  }
  return false;
};

const setCourtCheckBox = (doc: Document, courtName: string) => {
  if (courtName.startsWith("最高")) {
    (
      doc.getElementById(
        "InputCourt_Control_CourtCheckBox0",
      ) as HTMLInputElement
    ).checked = true;
  }
  if (courtName.endsWith("高等裁判所")) {
    (
      doc.getElementById(
        "InputCourt_Control_CourtCheckBox1",
      ) as HTMLInputElement
    ).checked = true;
  }
  if (courtName.endsWith("地方裁判所")) {
    (
      doc.getElementById(
        "InputCourt_Control_CourtCheckBox2",
      ) as HTMLInputElement
    ).checked = true;
  }
  if (courtName.endsWith("家庭裁判所")) {
    (
      doc.getElementById(
        "InputCourt_Control_CourtCheckBox3",
      ) as HTMLInputElement
    ).checked = true;
  }
};

/**
 * 事件番号調査用のCSVから一括貼り付け
 * SmoothCSVからのコピーを前提に、列はタブ区切りで扱う
 */
const pasteSmoothCsv = (doc: Document, cb: string): boolean => {
  const fields = cb.split("\t").map(sanitizeString);
  const court = fields[SMOOTH_CSV_COL.COURT]!;
  const date = fields[SMOOTH_CSV_COL.DATE]!;
  const detail = fields[SMOOTH_CSV_COL.DETAIL]!;
  const casenumber = fields[SMOOTH_CSV_COL.CASE_NUMBER]!;

  if (fillLexId(doc, detail)) {
    return true;
  }

  const dateFillResult = fillDateFields(doc, date) !== null;
  if (fillCaseNumber(doc, casenumber)) {
    return true;
  }

  const freewords = [];
  const courtExpanded = expandCourtAbbrev(court);
  if (courtExpanded) {
    freewords.push(formatCourtName(courtExpanded));
    setCourtCheckBox(doc, courtExpanded);
  }
  freewords.push(formatDetail(detail));

  const freewordFillResult = fillFreewords(doc, sliceFreewords(freewords));
  return dateFillResult || freewordFillResult;
};

/**
 * 判例文字列からの貼り付け
 * 例：「札幌地判令和3・3・17判時2487号3頁」
 */
const pastePrecedent = (doc: Document, cb: string): boolean => {
  const s = sanitizeString(cb.replace(/\s/g, "").replace(/[\r\n]+/g, ""));
  if (fillLexId(doc, s)) {
    return true;
  }

  const caseNumberFillResult = fillCaseNumber(doc, s);
  const filledTimestamp = fillDateFields(doc, s);

  const freewords = [];

  const courtName = deriveLeadingCourtName(s);
  if (courtName) {
    freewords.push(formatCourtName(courtName));
    setCourtCheckBox(doc, courtName);
  }

  if (!caseNumberFillResult && filledTimestamp) {
    const detail = s.slice(filledTimestamp.end);
    freewords.push(formatDetail(detail));
  }
  const freewordFillResult = fillFreewords(doc, sliceFreewords(freewords));

  return caseNumberFillResult || filledTimestamp !== null || freewordFillResult;
};

/**
 * タブ区切りの文字列であれば、SmoothCSVの貼り付け処理を行い、
 * そうでなければ判例文字列の貼り付け処理を行う
 */
export const pasteAndSearch: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb,
) => {
  if (10 <= cb.split("\t").length) {
    return pasteSmoothCsv(bodyDocument, cb);
  }
  return pastePrecedent(bodyDocument, cb);
};
