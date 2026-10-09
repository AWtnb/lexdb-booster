// https://www.legal-info.com/build/assets/list-RexmrXCp.js

/**
 * 詳細ボタン・一覧印刷ボタンのIDを切り替えて活性/非活性を制御する
 * チェック済み要素の有無に応じてサフィックス `_D` を付け外しする
 */
const toggleDetailButtons = (hasChecked: boolean) => {
  if (hasChecked) {
    document.getElementById("detailbtn_D")?.setAttribute("id", "detailbtn");
    document
      .getElementById("itiranprn_btn_D")
      ?.setAttribute("id", "itiranprn_btn");
    return;
  }
  document.getElementById("detailbtn")?.setAttribute("id", "detailbtn_D");
  document
    .getElementById("itiranprn_btn")
    ?.setAttribute("id", "itiranprn_btn_D");
};

/**
 * ブラウザキャッシュを無効化するためのクエリ文字列を生成する
 * ランダム値・タイムスタンプ・CSRFトークンを連結した文字列を返す
 */
const generateCacheBuster = (csrfToken: string): string => {
  const rand = Math.floor(1e3 * Math.random()).toString(16);
  const timestamp = new Date().getTime().toString(16);
  return `${rand}${timestamp}${csrfToken}`;
};

/**
 * フォームのaction URLにキャッシュバスタークエリを付与して返す
 * 既存のクエリストリングは除去してから付与する
 */
const buildActionUrl = (action: string, cacheBuster: string): string => {
  const base = action.includes("?")
    ? action.substring(0, action.indexOf("?"))
    : action;
  return `${base}?${cacheBuster}`;
};

/**
 * 指定インデックスの検索結果リンクを選択状態にしてフォームをサブミットする
 * チェックボックスのON・ボタン状態の更新・hidden inputへのID設定を行う
 */
const openResult = (index: number): boolean => {
  const results = document.querySelectorAll("a.list_link[data-id]");
  const link = results[index] as HTMLAnchorElement;
  const dataId = link.getAttribute("data-id");
  if (!dataId) return false;

  // チェックボックスをONにする
  const row = link.closest("tr");
  const checkbox = row?.querySelector<HTMLInputElement>(".check_list");
  if (checkbox) checkbox.checked = true;

  // ボタンの活性/非活性を切り替える
  const hasChecked =
    0 < document.querySelectorAll(".check_list:checked").length;
  toggleDetailButtons(hasChecked);

  // 選択IDをセット
  const selectId = document.getElementById(
    "select_id",
  ) as HTMLInputElement | null;
  if (selectId) selectId.value = dataId;

  // フォームをサブミット
  const form = document.getElementById("list_form") as HTMLFormElement | null;
  if (!form) return false;

  const csrfToken =
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
      ?.content ?? "";
  const cacheBuster = generateCacheBuster(csrfToken);
  form.action = buildActionUrl(form.action, cacheBuster);
  form.submit();

  return true;
};

/**
 * 検索結果が1件のみの場合に自動で先頭結果を開く
 * ページロード時に呼び出すことを想定している
 */
export const handleSearchResult = (): boolean => {
  return openResult(0);
};
