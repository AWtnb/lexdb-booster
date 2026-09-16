export const gotoSyoshi = (url: URL): void => {
  if (url.pathname === "/lexbin/LinkZenbun.aspx") {
    url.pathname = "/lexbin/LinkSyoshi.aspx";
  } else {
    url.pathname = "/lexbin/ShowSyoshi.aspx";
  }
  window.location.href = url.toString();
};
