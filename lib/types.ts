/**
 * フレームのwindowオブジェクト
 * SubmitSearchBottomはページ内で定義されるグローバル関数
 * _hotkeyInitializedは初期化済みかどうかのフラグ（多重登録防止用）
 */
export type FrameWindow = Window & {
  _hotkeyInitialized?: boolean;
  SubmitSearchBottom?: (mode: string, target: string) => void;
  ShowBunken?: (mode: string, num: string) => void;
};

export type FramePair = {
  headWindow: FrameWindow;
  headDocument: Document;
  bodyWindow: FrameWindow;
  bodyDocument: Document;
};

export type HotkeyContext = FramePair & {
  url: URL;
  keyEvent: KeyboardEvent;
  isInputableElem: boolean;
};

export type HotkeyAction = (ctx: HotkeyContext) => boolean | Promise<boolean>;
export type HotkeyActionWithClipboardText = (
  ctx: HotkeyContext,
  clipboardText: string,
) => boolean | Promise<boolean>;

export type OpenResultId = `openResult${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

/**
 * アクションを識別するID
 */
export type ActionId =
  | "submitSearch"
  | "goHome"
  | "clearAllInputBox"
  | "pasteCaseNumber"
  | "pasteDate"
  | "pasteLexId"
  | "focusFreeWord"
  | "cycleFreeWord"
  | "pasteSmoothCsv"
  | "copyCaseNumber"
  | "copyReference"
  | "copyReferenceTsv"
  | "copyReferenceId"
  | "copyFullReference"
  | "gotoZenbun"
  | "gotoSyoshi"
  | "gotoSearchResults"
  | "openTopResult"
  | OpenResultId;

/**
 * キー文字列とアクションIDの対応
 * 将来的にユーザー設定（optionページ・storage）から読み込む部分
 */
export type KeyBinding = {
  key: string;
  actionId: ActionId;
};
