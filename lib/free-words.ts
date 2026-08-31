import { getReferenceDetail, toFullWidthDigits } from "./text-utils";

/**
 * フリーワードの要素ID（最大5件）
 */
export const FREEWORD_IDS = [
  "InputFreeKeyword_Control_KEYWORD00",
  "InputFreeKeyword_Control_KEYWORD05",
  "InputFreeKeyword_Control_KEYWORD10",
  "InputFreeKeyword_Control_KEYWORD15",
  "InputFreeKeyword_Control_KEYWORD20",
];

/**
 * フリーワードに複数の語を入力する
 */
export const setFreeWords = (
  doc: Document,
  court: string,
  references: string[],
): void => {
  const freewords = [court];
  const reg = /\(([明大昭平令][0-9０-９]{1,2})\)(.*)/;

  references.forEach((s) => {
    const result = reg.exec(s);
    if (result) {
      freewords.push(`（${result[1]}）${result[2]}`);
      return;
    }
    const detail = getReferenceDetail(s);
    if (detail !== "") {
      freewords.push(toFullWidthDigits(detail));
    }
  });

  for (let i = 0; i < freewords.length && i < FREEWORD_IDS.length - 1; i++) {
    const word = freewords[i]!;
    const elem = doc.getElementById(FREEWORD_IDS[i]!) as HTMLInputElement;
    elem.value = word;
    elem.focus();
  }
};
