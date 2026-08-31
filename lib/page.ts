export const isDetailPage = (url: URL): boolean => {
  return (
    url.pathname.endsWith("ShowSyoshi.aspx") ||
    url.pathname.endsWith("LinkSyoshi.aspx")
  );
};

export const isZenbunPage = (url: URL): boolean => {
  return url.pathname.endsWith("ShowZenbun.aspx");
};

export const isSearchResultPage = (url: URL): boolean => {
  return url.pathname.endsWith("SearchAllResult.aspx");
};

export const isSearchPage = (url: URL): boolean => {
  return url.pathname.endsWith("SearchAll.aspx");
};
