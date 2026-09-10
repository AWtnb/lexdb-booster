/** 高等裁判所リスト */
export const HIGH_COURTS = [
  "札幌",
  "仙台",
  "東京",
  "知的財産",
  "名古屋",
  "大阪",
  "広島",
  "高松",
  "福岡",
];

/** 地方裁判所リスト */
export const DISTRICT_COURTS = [
  "旭川",
  "釧路",
  "札幌",
  "函館",
  "青森",
  "盛岡",
  "仙台",
  "秋田",
  "山形",
  "福島",
  "水戸",
  "宇都宮",
  "前橋",
  "さいたま",
  "浦和",
  "千葉",
  "東京",
  "横浜",
  "新潟",
  "富山",
  "金沢",
  "福井",
  "甲府",
  "長野",
  "岐阜",
  "静岡",
  "名古屋",
  "津",
  "大津",
  "京都",
  "大阪",
  "神戸",
  "奈良",
  "和歌山",
  "鳥取",
  "松江",
  "岡山",
  "広島",
  "山口",
  "徳島",
  "高松",
  "松山",
  "高知",
  "福岡",
  "佐賀",
  "長崎",
  "熊本",
  "大分",
  "宮崎",
  "鹿児島",
  "那覇",
];

/**
 * 裁判所の略称を完全表記に展開する（例: "東京地" → "東京地方裁判所"）
 */
export const expandCourtAbbrev = (s: string): string => {
  // 最高裁判所の場合
  if (s.startsWith("最")) {
    if (s === "最一小") return "最高裁判所第一小法廷";
    if (s === "最二小") return "最高裁判所第二小法廷";
    if (s === "最三小") return "最高裁判所第三小法廷";
    if (s === "最大") return "最高裁判所大法廷";
    return "最高裁判所";
  }

  if (s.indexOf("知財") !== -1 || s.indexOf("知的財産") !== -1) {
    return "知的財産高等裁判所";
  }

  // 高等裁判所の場合
  if (s.endsWith("高")) {
    const name = s.slice(0, -1);
    return HIGH_COURTS.includes(name) ? `${name}高等裁判所` : "";
  }

  // 地方裁判所の場合
  if (s.endsWith("地")) {
    const name = s.slice(0, -1);
    return DISTRICT_COURTS.includes(name) ? `${name}地方裁判所` : "";
  }

  // 支部の場合
  if (s.endsWith("支")) {
    const courtPatterns = [
      { prefixes: DISTRICT_COURTS.map((c) => `${c}地`), middle: "方裁判所" },
      { prefixes: DISTRICT_COURTS.map((c) => `${c}家`), middle: "庭裁判所" },
      { prefixes: HIGH_COURTS.map((c) => `${c}高`), middle: "等裁判所" },
    ];

    for (const pattern of courtPatterns) {
      for (const prefix of pattern.prefixes) {
        if (s.startsWith(prefix)) {
          return `${prefix}${pattern.middle}${s.substring(prefix.length)}部`;
        }
      }
    }
  }

  return "";
};
