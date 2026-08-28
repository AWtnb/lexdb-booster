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

type HotkeyAction = (ctx: HotkeyContext) => void;

// ============================================================================
// ユーティリティ
// ============================================================================

/**
 * キー入力文字列を生成する（例: "A-l"）
 */
const buildKeyString = (keyEvent: KeyboardEvent): string => {
  return (
    (keyEvent.ctrlKey ? "C-" : "") +
    (keyEvent.altKey ? "A-" : "") +
    (keyEvent.shiftKey ? "S-" : "") +
    keyEvent.key.toLowerCase()
  );
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

// ============================================================================
// ホットキーマップ
// ============================================================================

/**
 * キー文字列ごとのアクションをまとめたマップ
 * 追加する場合はここにエントリを増やすだけでよい
 * どの依存（headWindow/bodyWindow/bodyDocument）を使うかはアクション側の関心事
 */
const HOTKEY_ACTIONS: Record<string, HotkeyAction> = {
  "A-enter": submitSearch,
  "A-l": submitSearch,
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

  bodyDocument.onkeyup = (keyEvent) => {
    const pressed = buildKeyString(keyEvent);
    HOTKEY_ACTIONS[pressed]?.(ctx);
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
    "https://www.lawlibrary.jp/Law/ReLoginForm.aspx",
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
