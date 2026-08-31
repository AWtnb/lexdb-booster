import { expandCourtAbbrev } from "../court";
import { FREEWORD_IDS, setFreeWords } from "../free-words";
import { parseKiriLines } from "../kiri";
import {
  expandGengo,
  toFullWidthDigits,
  toGengouAndTripletNum,
  toHalfWidth,
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

export const pressSubmitButton: HotkeyAction = ({ headWindow, url }) => {
  if (url.pathname.endsWith("SearchAll.aspx")) {
    console.log(headWindow.SubmitSearchBottom);
    headWindow.SubmitSearchBottom?.("search", "_parent");
  }
};

/**
 * 事件番号貼り付け処理
 */
export const handleCaseNumberPaste: HotkeyActionWithClipboardText = (
  { bodyDocument },
  caseNumber: string,
): void => {
  caseNumber = caseNumber
    .replace(/^[\?？]/, "")
    .replace(/^（/, "")
    .replace(/）$/, "");
  const topCaseNum = toHalfWidth(caseNumber).split("、")[0]!;
  const startParenPos = topCaseNum.indexOf("(");
  if (startParenPos === -1) return;

  const gengo = topCaseNum.substring(0, startParenPos).replace(/[0-9].+$/g, "");
  const g = expandGengo(gengo.substring(0, 1)).toString();
  const y = topCaseNum.substring(0, startParenPos).replace(/[^0-9]/g, "");
  const endParenPos = topCaseNum.indexOf(")");
  if (endParenPos === -1) return;

  const category = topCaseNum.substring(startParenPos + 1, endParenPos);
  const code = topCaseNum.substring(endParenPos + 1).replace(/[^0-9]/g, "");

  setSelectBoxValue(
    bodyDocument,
    "InputJikenBangou_Control_JikenBangou_DropDownList",
    g,
  );
  (
    bodyDocument.getElementById(
      "InputJikenBangou_Control_JikenBangouText0",
    ) as HTMLInputElement
  ).value = y;
  (
    bodyDocument.getElementById(
      "InputJikenBangou_Control_JikenBangouText1",
    ) as HTMLInputElement
  ).value = category;
  (
    bodyDocument.getElementById(
      "InputJikenBangou_Control_JikenBangouText2",
    ) as HTMLInputElement
  ).value = code;
  bodyDocument
    .getElementById("InputJikenBangou_Control_JikenBangouText0")
    ?.scrollIntoView();
};

/**
 * 日付貼り付け処理
 */
export const handleDatePaste: HotkeyActionWithClipboardText = (
  { bodyDocument },
  cb,
): void => {
  const dateStr = toHalfWidth(cb);
  const fmt = dateStr.replace(/日$/, "").replace(/[年月]/g, ".");
  const elems = fmt.split(".").map((s) => s.replace(/[^0-9]/g, ""));
  if (elems.length < 3) return;

  const g = expandGengo(dateStr.substring(0, 1)).toString();

  (
    bodyDocument.getElementById(
      "InputHanketuYMD_Control_HANKETU_YEAR0",
    ) as HTMLInputElement
  ).value = elems[0] || "";
  (
    bodyDocument.getElementById(
      "InputHanketuYMD_Control_HANKETU_MONTH0",
    ) as HTMLInputElement
  ).value = elems[1] || "";
  (
    bodyDocument.getElementById(
      "InputHanketuYMD_Control_HANKETU_DAY0",
    ) as HTMLInputElement
  ).value = elems[2] || "";

  setSelectBoxValue(
    bodyDocument,
    "InputHanketuYMD_Control_NENGOU_DropDownList0",
    g,
  );
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

export const setLexId = (doc: Document, lexId: string): void => {
  (
    doc.getElementById(
      "InputHanketuYMD_Control_HanketuSubeteRadioButton",
    ) as HTMLInputElement
  ).click();
  (
    doc.getElementById("InputBunban_Control_BUNKEN00") as HTMLInputElement
  ).value = lexId;
  doc
    .getElementById("InputHanketuYMD_Control_HanketuSubeteRadioButton")
    ?.scrollIntoView();
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
  const [g, a, b, c] = toGengouAndTripletNum(date);
  (
    doc.getElementById(
      "InputHanketuYMD_Control_HanketuShiteiRadioButton",
    ) as HTMLInputElement
  ).click();

  setSelectBoxValue(doc, "InputHanketuYMD_Control_NENGOU_DropDownList0", g!);
  (
    doc.getElementById(
      "InputHanketuYMD_Control_HANKETU_YEAR0",
    ) as HTMLInputElement
  ).value = a!;
  (
    doc.getElementById(
      "InputHanketuYMD_Control_HANKETU_MONTH0",
    ) as HTMLInputElement
  ).value = b!;
  (
    doc.getElementById(
      "InputHanketuYMD_Control_HANKETU_DAY0",
    ) as HTMLInputElement
  ).value = c!;
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
    .map((s) => s.replace(/^[\?？]/, ""))
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
