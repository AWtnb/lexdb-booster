import { toFullWidth, YEAR_LABEL_ABBREV_TO_FULL } from "@/lib/text-utils";

export const styleUp = () => {
  Array.from(document.querySelectorAll(".yoshiBox tbody")).forEach((el) => {
    const cells = Array.from(el.getElementsByTagName("td"));
    const firstCell = cells.shift();
    if (firstCell) {
      firstCell.innerText =
        firstCell.innerText.replace("関信", "関東信越") + "国税不服審判所";
      firstCell.style.background = "gold";
    }
    const lastCell = cells.pop();
    if (!lastCell) return;
    const m = lastCell.innerText.match(
      /([明大昭平令])\s*([0-9]+|元)[-−–—]([0-9]+)/,
    );
    if (m) {
      const y = m[2] == "元" ? "１" : toFullWidth(m[2]!);
      const fullLabel = YEAR_LABEL_ABBREV_TO_FULL.get(m[1]!);
      const caseNumber = `${fullLabel}${y}年（－）第${toFullWidth(m[3]!)}号`;
      lastCell.insertAdjacentHTML(
        "beforeend",
        `<p style="background:salmon">${caseNumber}</p>`,
      );
    }
  });
};

export const goSearchHome = (): boolean => {
  window.location.href =
    "https://www.kfs.go.jp/cgi-bin/sysrch/prj/web/pub/editCriteriaByKeyword";
  return true;
};
