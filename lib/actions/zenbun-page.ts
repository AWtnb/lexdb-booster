import type { HotkeyAction } from "../types";

export const gotoSyoshi: HotkeyAction = ({ url }): boolean => {
  if (url.pathname === "/lexbin/LinkZenbun.aspx") {
    url.pathname = "/lexbin/LinkSyoshi.aspx";
  } else {
    url.pathname = "/lexbin/ShowSyoshi.aspx";
  }
  window.location.href = url.toString();
  return true;
};
