export const goHome = (): boolean => {
  const el = document.getElementById("search-form") as HTMLFormElement | null;
  if (!el) return false;
  el.submit();
  return true;
};
