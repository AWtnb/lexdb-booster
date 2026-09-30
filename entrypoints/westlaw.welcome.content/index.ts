import { defineContentScript } from "wxt/utils/define-content-script";

export default defineContentScript({
  matches: ["https://go.westlawjapan.com/wljp/app/welcome*"],
  main: () => {
    document.getElementById("ft")?.focus();
  },
});
