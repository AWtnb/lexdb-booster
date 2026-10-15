import {
  matchTimestamp,
  sanitizeString,
  YEAR_LABEL_CODE_TO_LABEL_ABBREV,
} from "@/lib/text-utils";

const syncFields = () => {
  const baseIds = ["slNengo", "txtYear", "txtMonth", "txtDay"];

  for (const baseId of baseIds) {
    const source = document.getElementById(
      `${baseId}1`,
    ) as HTMLInputElement | null;
    const target = document.getElementById(
      `${baseId}2`,
    ) as HTMLInputElement | null;
    if (!source || !target) {
      continue;
    }
    target.value = source.value;
  }
};

export const syncDateInput = () => {
  ["slNengo1", "txtYear1", "txtMonth1", "txtDay1"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", syncFields);
    }
  });
};

type FormField = HTMLInputElement | HTMLSelectElement;

const setFieldValue = (el: FormField, value: string): boolean => {
  el.value = value;

  // select は一致する option が無いと value が "" になる
  if (el.value !== value) return false;

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
};

const fillDateFields = (s: string): boolean => {
  const timestamp = matchTimestamp(sanitizeString(s));
  if (!timestamp) return false;

  const nengo = YEAR_LABEL_CODE_TO_LABEL_ABBREV.get(
    timestamp.date.yearLabel.code,
  );
  if (!nengo) return false;

  const fields = [
    { id: "slNengo", value: nengo },
    { id: "txtYear", value: String(timestamp.date.year) },
    { id: "txtMonth", value: String(timestamp.date.month) },
    { id: "txtDay", value: String(timestamp.date.day) },
  ];

  // 先に全要素を取得し、1つでも欠けていれば何も書き換えない
  const targets: { el: FormField; value: string }[] = [];
  for (const { id, value } of fields) {
    const el1 = document.getElementById(`${id}1`) as FormField | null;
    const el2 = document.getElementById(`${id}2`) as FormField | null;
    if (!el1 || !el2) return false;
    targets.push({ el: el1, value }, { el: el2, value });
  }

  // 一部だけ入力された状態を避けるため、全件の成否を集約して返す
  return targets
    .map(({ el, value }) => setFieldValue(el, value))
    .every(Boolean);
};

export const pasteDateField = (clipboardText: string): boolean =>
  fillDateFields(clipboardText);
