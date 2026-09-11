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
  words: string[],
): void => {
  const reg = /\(([明大昭平令][0-9０-９]{1,2})\)(.*)/;

  const freewords = words.flatMap((word) => {
    const result = reg.exec(word);
    if (result) {
      return [`（${result[1]}）${result[2]}`];
    }
    const detail = getReferenceDetail(word);
    if (detail !== "") {
      return [toFullWidthDigits(detail)];
    }
    return [];
  });

  if (court) {
    freewords.unshift(court);
  }

  freewords.slice(0, 5).forEach((w, i) => {
    const elem = doc.getElementById(FREEWORD_IDS[i]!) as HTMLInputElement;
    elem.value = w;
  });
};
