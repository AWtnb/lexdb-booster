import { expandCourtAbbrev } from "../court";
import { FREEWORD_IDS, setFreeWords } from "../free-words";
import { parseKiriLines } from "../kiri";
import {
  getYearCode,
  toFullWidthDigits,
  parseDateString,
  toHalfWidth,
  parseCaseNumber,
  trimUncertainPrefix,
} from "../text-utils";
import { setSelectBoxValue } from "../ui";
import type { HotkeyAction, HotkeyActionWithClipboardText } from "../types";

/**
 * 入力フィールドをすべてクリアする
 */
export const clearAllInputBox: HotkeyAction = ({ bodyDocument }): void => {
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
};

/**
 * 「検索開始」ボタンを押す
 */
export const pressSubmitButton: HotkeyAction = ({ headWindow, url }) => {
  if (url.pathname.endsWith("SearchAll.aspx")) {
    headWindow.SubmitSearchBottom?.("search", "_parent");
  }
};

/**
 * 事件番号貼り付け処理
 */
export const handleCaseNumberPaste: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb: string,
): void => {
  const caseNumber = parseCaseNumber(cb);
  if (!caseNumber) return;
  const { code, year, sign, num } = caseNumber;

  setSelectBoxValue(
    bodyDocument,
    "InputJikenBangou_Control_JikenBangou_DropDownList",
    code,
  );

  [
    { id: "InputJikenBangou_Control_JikenBangouText0", value: year.toString() },
    { id: "InputJikenBangou_Control_JikenBangouText1", value: sign },
    { id: "InputJikenBangou_Control_JikenBangouText2", value: num.toString() },
  ].forEach(({ id, value }) => {
    (bodyDocument.getElementById(id) as HTMLInputElement).value = value;
  });
};

/**
 * 日付貼り付け処理
 */
export const handleDatePaste: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb,
): void => {
  fillDateFields(bodyDocument, cb);
};

/**
 * フリーワードの最後の入力済み欄にフォーカスする
 */
export const handleFreeWordFocus: HotkeyAction = ({ bodyDocument }): void => {
  for (let i = 0; i < FREEWORD_IDS.length; i++) {
    const elem = bodyDocument.getElementById(
      FREEWORD_IDS[i]!,
    ) as HTMLInputElement;
    if (elem.value !== "") continue;

    if (i === 0) {
      elem.focus();
      break;
    }
    (
      bodyDocument.getElementById(FREEWORD_IDS[i - 1]!) as HTMLInputElement
    ).select();
    break;
  }
};

/**
 * フリーワードの空いている欄にフォーカスする
 */
export const handleBlankFreeWordFocus: HotkeyAction = ({
  bodyDocument,
}): void => {
  for (const elemId of FREEWORD_IDS) {
    const elem = bodyDocument.getElementById(elemId) as HTMLInputElement;
    if (elem.value === "") {
      elem.focus();
      break;
    }
  }
};

const setLexId = (doc: Document, lexId: string): void => {
  (
    doc.getElementById("InputBunban_Control_BUNKEN00") as HTMLInputElement
  ).value = lexId;
};

/**
 * LEX文献番号を貼り付ける処理
 */
export const handleLexIdPaste: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb,
): void => {
  const lexIdMatch = toHalfWidth(cb).match(/\d{8}$/);
  if (lexIdMatch) {
    setLexId(bodyDocument, lexIdMatch[0]);
  }
};

/**
 * 日付欄への入力を共通化（指定モードに切り替えてから値をセット）
 */
const fillDateFields = (doc: Document, date: string): void => {
  const { code, y, m, d } = parseDateString(date);
  console.log(code, y, m, d);
  (
    doc.getElementById(
      "InputHanketuYMD_Control_HanketuShiteiRadioButton",
    ) as HTMLInputElement
  ).checked = true;

  setSelectBoxValue(doc, "InputHanketuYMD_Control_NENGOU_DropDownList0", code);

  [
    {
      id: "InputHanketuYMD_Control_HANKETU_YEAR0",
      value: y,
    },
    {
      id: "InputHanketuYMD_Control_HANKETU_MONTH0",
      value: m,
    },
    {
      id: "InputHanketuYMD_Control_HANKETU_DAY0",
      value: d,
    },
  ].forEach(({ id, value }) => {
    (doc.getElementById(id) as HTMLInputElement).value = value;
  });
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
export const handleSmoothCsvPaste: HotkeyActionWithClipboardText = (
  ctx,
  cb,
): void => {
  const { bodyDocument } = ctx;
  const line = toHalfWidth(cb);
  const fields = line
    .split("\t")
    .map(trimUncertainPrefix)
    .map((s) => s.split("=").slice(-1)[0]);

  const court = fields[SMOOTH_CSV_COL["COURT"]]!;
  const date = fields[SMOOTH_CSV_COL["DATE"]]!;
  const detail = fields[SMOOTH_CSV_COL["DETAIL"]]!;
  const casenumber = fields[SMOOTH_CSV_COL["CASE_NUMBER"]]!;

  const lexIdMatch = detail.match(/\d{8}$/);
  if (lexIdMatch) {
    setLexId(bodyDocument, lexIdMatch[0]);
    return;
  }

  const caseNumberMatch = casenumber.match(
    /(明治|大正|昭和|平成|令和)([0-9]{1,2}|元)年\(.{1,3}\)第[0-9]+号/,
  );
  if (caseNumberMatch) {
    handleCaseNumberPaste(ctx, caseNumberMatch[0]);
  }

  try {
    fillDateFields(bodyDocument, date);
  } catch (error) {
    console.error("SmoothCSV貼り付けエラー:", error);
  }

  const courtExpanded = expandCourtAbbrev(court);
  const fullwidthDetail = toFullWidthDigits(detail);
  setFreeWords(bodyDocument, courtExpanded, [fullwidthDetail]);
};

/**
 * 桐の行コピーから一括貼り付け
 */
export const handleKiriPaste: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb: string,
): void => {
  const kiri = parseKiriLines(cb);

  if (kiri.src) {
    const lexIdMatch = kiri.src.match(/\d{8}$/);
    if (lexIdMatch) {
      setLexId(bodyDocument, lexIdMatch[0]);
      return;
    }
  }

  if (!kiri.date) return;

  try {
    fillDateFields(bodyDocument, kiri.date);
    setFreeWords(
      bodyDocument,
      expandCourtAbbrev(kiri.place.slice(0, -1)),
      kiri.src.split("・"),
    );
  } catch (error) {
    console.error("桐貼り付けエラー:", error);
  }
};
