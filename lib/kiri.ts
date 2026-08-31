import type { KiriLine } from "./types";

/**
 * 桐の行コピーをパースして裁判所・日付・出典を抽出する
 */
export const parseKiriLines = (s: string): KiriLine => {
  const dataLine = s.replace(/\r/g, "").split("\n")[1]!;
  const fields = dataLine.split("\t");

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]!;
    if (
      ["命", "委", "取", "令", "審", "決", "判"].includes(
        f.substring(f.length - 1),
      )
    ) {
      return {
        place: fields[i]!,
        date: fields[i + 1]!,
        src: fields[i + 2]!,
      };
    }
  }

  return {
    place: "",
    date: "",
    src: "",
  };
};
