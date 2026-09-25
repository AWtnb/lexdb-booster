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

/**
 * 裁判所の完全表記を略称に変換する（例: "東京地方裁判所" → "東京地"）
 */
export const abbreviateCourtName = (s: string): string => {
  console.log(s);
  // 最高裁判所の場合
  if (s.startsWith("最高裁判所")) {
    if (s === "最高裁判所第一小法廷") return "最一小";
    if (s === "最高裁判所第二小法廷") return "最二小";
    if (s === "最高裁判所第三小法廷") return "最三小";
    if (s === "最高裁判所大法廷") return "最大";
    return "最";
  }

  // 知的財産高等裁判所の場合
  if (s === "知的財産高等裁判所") return "知財高";

  // 支部の場合（"〇〇裁判所△△支部" 形式）
  if (s.endsWith("支部")) {
    const base = s.slice(0, -2); // "支部" を除去

    for (const name of HIGH_COURTS) {
      const full = `${name}高等裁判所`;
      if (!base.startsWith(full)) continue;
      return `${name}高${base.slice(full.length)}支`;
    }
    for (const name of DISTRICT_COURTS) {
      const full = `${name}地方裁判所`;
      if (!base.startsWith(full)) continue;
      return `${name}地${base.slice(full.length)}支`;
    }
    for (const name of DISTRICT_COURTS) {
      const full = `${name}家庭裁判所`;
      if (!base.startsWith(full)) continue;
      return `${name}家${base.slice(full.length)}支`;
    }
  }

  // 高等裁判所の場合
  for (const name of HIGH_COURTS) {
    if (s === `${name}高等裁判所`) return `${name}高`;
  }

  // 地方裁判所の場合
  for (const name of DISTRICT_COURTS) {
    if (s === `${name}地方裁判所`) return `${name}地`;
  }

  // 家庭裁判所の場合（元コードに含まれていないが展開側で扱っているため）
  for (const name of DISTRICT_COURTS) {
    if (s === `${name}家庭裁判所`) return `${name}家`;
  }

  return "";
};

const lenOrdered = (lines: string[]): string[] =>
  [...lines].sort((a, b) => b.length - a.length);

const getLeadingCourtBranch = (s: string): string => {
  const m = /^.+支部?/.exec(s);
  if (!m) return "";
  return `${m[0]}部`.replace(/部部$/, "部");
};

/*
 * 文字列の先頭から裁判所名を抽出する
 * 例: "東京地" → "東京地方裁判所"
 * 例: "東京地裁" → "東京地方裁判所"
 */
export const deriveLeadingCourtName = (s: string): string => {
  const courtConfigs = [
    {
      names: HIGH_COURTS,
      suffix: "高",
      full: "高等裁判所",
      abbr: "(等裁判所|裁)?",
    },
    {
      names: DISTRICT_COURTS,
      suffix: "地",
      full: "地方裁判所",
      abbr: "(方裁判所|裁)?",
    },
  ];

  for (const { names, suffix, full, abbr } of courtConfigs) {
    for (const name of lenOrdered(names)) {
      const m = new RegExp(`^${name}${suffix}${abbr}`).exec(s);
      if (!m) continue;
      const branch = getLeadingCourtBranch(s.slice(m[0].length));
      return `${name}${full}${branch}`;
    }
  }

  if (s.startsWith("最")) {
    if (s.startsWith("最一小")) return "最高裁判所第一小法廷";
    if (s.startsWith("最二小")) return "最高裁判所第二小法廷";
    if (s.startsWith("最三小")) return "最高裁判所第三小法廷";
    if (s.startsWith("最大")) return "最高裁判所大法廷";
    return "最高裁判所";
  }

  return "";
};
