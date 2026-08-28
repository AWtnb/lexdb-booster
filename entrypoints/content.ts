import { defineContentScript } from "wxt/utils/define-content-script";

// ============================================================================
// 型定義
// ============================================================================

type FrameWindow = Window & {
  _hotkeyInitialized?: boolean;
  SubmitSearchBottom?: (mode: string, target: string) => void;
};

type FramePair = {
  headWindow: FrameWindow;
  bodyWindow: FrameWindow;
  bodyDocument: Document;
};

/**
 * ホットキーアクションが参照できる依存一式
 * 今後 bodyWindow や bodyDocument を使うアクションを増やしても
 * この型・contextにフィールドを追加するだけでよい
 */
type HotkeyContext = FramePair & {
  url: URL;
};

/**
 * アクションを識別するID
 * optionページの保存データやキーバインド設定はこのIDを介してやりとりする
 */
type ActionId = "submitSearch" | "clearBodyInputs" | "focusBodyFrame";

type HotkeyAction = (ctx: HotkeyContext) => void;

/**
 * キー文字列とアクションIDの対応
 * 将来的にユーザー設定（optionページ・storage）から読み込む部分
 */
type KeyBinding = {
  key: string;
  actionId: ActionId;
};

// ============================================================================
// ユーティリティ
// ============================================================================

// ============================================================================
// modkeyの順序定義（唯一の真実）
// ============================================================================

/**
 * 修飾キーのプレフィックスと、対応するKeyboardEventのプロパティ名
 * 配列の順序がそのまま文字列連結の順序になる
 * ここを変更すれば全体の順序が追従する
 */
const MODIFIER_ORDER: { prefix: string; eventKey: keyof KeyboardEvent }[] = [
  { prefix: "C-", eventKey: "ctrlKey" },
  { prefix: "A-", eventKey: "altKey" },
  { prefix: "S-", eventKey: "shiftKey" },
];

/**
 * KeyboardEventから修飾キー部分の文字列を組み立てる（例: "C-A-"）
 */
const buildModifierPrefix = (keyEvent: KeyboardEvent): string => {
  return MODIFIER_ORDER.filter(({ eventKey }) => keyEvent[eventKey])
    .map(({ prefix }) => prefix)
    .join("");
};

/**
 * キー入力文字列を生成する（例: "C-A-l"）
 */
const buildKeyString = (keyEvent: KeyboardEvent): string => {
  return buildModifierPrefix(keyEvent) + keyEvent.key.toLowerCase();
};

/**
 * ユーザーがoptionページなどで自由な順序で入力したキー文字列を正規化する
 * 例: "S-A-c" と "A-S-c" はどちらも "A-S-c" になる
 * KeyBinding保存前や読み込み時にこれを通すことで、順序ゆらぎによる不一致を防ぐ
 */
const normalizeKeyString = (raw: string): string => {
  const parts = raw.split("-");
  const mainKey = parts.pop() ?? "";
  const modSet = new Set(parts.map((p) => `${p}-`));

  const prefix = MODIFIER_ORDER.filter(({ prefix }) => modSet.has(prefix))
    .map(({ prefix }) => prefix)
    .join("");

  return prefix + mainKey.toLowerCase();
};
// ============================================================================
// アクション定義（実処理）
// ============================================================================

/**
 * head側フレームの検索実行ボタンを押す
 * SearchAll.aspx以外では何もしない
 */
const submitSearch: HotkeyAction = ({ headWindow, url }) => {
  if (!url.pathname.endsWith("SearchAll.aspx")) return;
  headWindow.SubmitSearchBottom?.("search", "_parent");
};

/**
 * bodyDocument内のテキスト入力欄をクリアする
 */
const clearBodyInputs: HotkeyAction = ({ bodyDocument }) => {
  bodyDocument
    .querySelectorAll<HTMLInputElement>("input[type='text']")
    .forEach((el) => {
      el.value = "";
    });
};

/**
 * bodyフレームにフォーカスする
 */
const focusBodyFrame: HotkeyAction = ({ bodyWindow }) => {
  bodyWindow.focus();
};

// ============================================================================
// アクションレジストリ（ID → 実処理）
// コード側の責務。ユーザー設定には含めない
// ============================================================================

const ACTION_REGISTRY: Record<ActionId, HotkeyAction> = {
  submitSearch,
  clearBodyInputs,
  focusBodyFrame,
};

// ============================================================================
// デフォルトのキーバインド（キー → ID）
// ユーザー設定が存在しない場合や初期値として使う
// 将来的にはoptionページで編集された内容でここを置き換える
// ============================================================================

const DEFAULT_KEY_BINDINGS: KeyBinding[] = [
  { key: "A-enter", actionId: "submitSearch" },
  { key: "A-l", actionId: "submitSearch" },
  { key: "A-c", actionId: "clearBodyInputs" },
];

/**
 * キーバインド配列から「キー文字列 → 実処理」のマップを組み立てる
 * KeyBinding[]（ユーザー設定由来のデータ）とACTION_REGISTRY（コード由来のデータ）を
 * ここで初めて結びつける
 */
const buildHotkeyActionMap = (
  bindings: KeyBinding[],
): Record<string, HotkeyAction> => {
  const map: Record<string, HotkeyAction> = {};
  for (const binding of bindings) {
    const action = ACTION_REGISTRY[binding.actionId];
    if (!action) {
      console.warn(`未知のactionIdです: ${binding.actionId}`);
      continue;
    }
    map[binding.key] = action;
  }
  return map;
};

// ============================================================================
// 単純ページ（フォーカスのみ）の処理
// ============================================================================

/**
 * ログイン系・トップページ・DB選択ページで初期フォーカスを当てる
 * 該当ページなら true を返す（呼び出し側でreturnの目印にする）
 */
const focusEntryPointIfMatched = (url: URL): boolean => {
  const focusTargets: { test: (u: URL) => boolean; elemId: string }[] = [
    {
      test: (u) =>
        u.host === "www.lawlibrary.jp" &&
        u.pathname === "/Law/ReLoginForm.aspx",
      elemId: "LinkButton1",
    },
    {
      test: (u) =>
        u.host === "www.lawlibrary.jp" &&
        u.pathname === "/Law/LawLibrary/LawTOP.aspx",
      elemId: "LexDbHyperLink",
    },
    {
      test: (u) => u.pathname === "/lexbin/DBSelectLaw.aspx",
      elemId: "DB1000_LinkButton",
    },
  ];

  const matched = focusTargets.find((t) => t.test(url));
  if (!matched) return false;

  document.getElementById(matched.elemId)?.focus();
  return true;
};

// ============================================================================
// フレーム取得
// ============================================================================

/**
 * head/bodyフレームのwindow・documentを取得する
 * 取得できない場合はnullを返す（フレーム未ロードなど）
 */
const getFramePair = (): FramePair | null => {
  const frameElems = document.getElementsByTagName("frame");
  if (frameElems.length < 2) {
    console.log("フレームが見つかりません");
    return null;
  }

  const headWindow = frameElems[0].contentWindow as FrameWindow | null;
  const bodyFrame = frameElems[1];
  const bodyWindow = bodyFrame.contentWindow as FrameWindow | null;
  if (!headWindow || !bodyWindow) {
    console.log("フレームのwindowが取得できません");
    return null;
  }

  const bodyDocument = bodyFrame.contentDocument || bodyWindow.document;
  return { headWindow, bodyWindow, bodyDocument };
};

/**
 * ホットキーをセットアップする
 * frame構成: frames[0] = head(ボタン側), frames[1] = contents(入力側)
 * セットアップに成功した（あるいは既に済んでいた）場合 true を返す
 */
const setupHotkeys = (): boolean => {
  const framePair = getFramePair();
  if (!framePair) return false;

  const { bodyWindow, bodyDocument } = framePair;

  if (bodyWindow._hotkeyInitialized) {
    console.log("すでにホットキーが初期化されています");
    return true;
  }

  const url = new URL(window.location.href);
  const ctx: HotkeyContext = { ...framePair, url };

  // 現状はデフォルト値を使う。後続でstorageから読み込む処理に差し替える
  const hotkeyActions = buildHotkeyActionMap(DEFAULT_KEY_BINDINGS);

  bodyDocument.onkeyup = (keyEvent) => {
    const pressed = buildKeyString(keyEvent);
    hotkeyActions[pressed]?.(ctx);
  };

  bodyWindow._hotkeyInitialized = true;
  console.log("ホットキーの設定が完了しました");
  return true;
};

/**
 * 初期化とリトライ処理
 * フレームのdocumentがload完了前だと取得に失敗するためリトライする
 */
const initializeHotkeysWithRetry = () => {
  if (setupHotkeys()) return;

  const maxRetries = 5;
  let retryCount = 0;
  const retryInterval = setInterval(() => {
    retryCount += 1;
    if (setupHotkeys() || maxRetries <= retryCount) {
      clearInterval(retryInterval);
    }
  }, 3000);
};

// ============================================================================
// エントリポイント
// ============================================================================

export default defineContentScript({
  matches: [
    "https://lex.lawlibrary.jp/lexbin/DBSelectLaw.aspx",
    "https://lex.lawlibrary.jp/lexbin/LinkSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/SearchAll.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllCheck.aspx",
    "https://lex.lawlibrary.jp/lexbin/SearchAllResult.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowSyoshi.aspx*",
    "https://lex.lawlibrary.jp/lexbin/ShowZenbun.aspx*",
    "https://www.lawlibrary.jp/Law/LawLibrary/LawTOP.aspx",
    "https://www.lawlibrary.jp/Law/ReLoginForm.aspx*",
  ],
  world: "MAIN",
  runAt: "document_idle",
  main: () => {
    const url = new URL(window.location.href);

    if (focusEntryPointIfMatched(url)) return;

    window.addEventListener("load", () => {
      initializeHotkeysWithRetry();
    });
  },
});
