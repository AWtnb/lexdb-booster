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
