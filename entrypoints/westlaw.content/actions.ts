export const pasteDateField = (clipboardText: string): boolean => {
  console.log(clipboardText);
  return true;
};

type WljpWindow = Window & {
  // 年月日セレクト系
  resetYearMonthDaySelect?: (
    id: string,
    yearSelectId: string,
    monthSelectId: string,
    daySelectId: string,
  ) => void;
  setYearMonthDayOptions?: (
    value: string,
    yearSelectId: string,
    monthSelectId: string,
    daySelectId: string,
    defaultYear: string,
    defaultMonth: string,
    disableFuture: string,
  ) => void;
  reoladYearMonthDayFlexselect?: (
    yearSelectId: string,
    monthSelectId: string,
    daySelectId: string,
  ) => void;

  // 年のみセレクト系
  resetYearSelect?: (yearSelectId: string) => void;
  setYearOptions?: (
    value: string,
    yearSelectId: string,
    disableFuture: string,
  ) => void;
  reoladYearFlexselect?: (yearSelectId: string) => void;
};

export const goSearchHome = (): boolean => {
  window.location.href =
    "https://go.westlawjapan.com/wljp/app/search/template?tid=wljpCasesSearchTemplate&clean=true";
  return true;
};

export const pressSubmitButton = (): boolean => {
  document.getElementById("submitSearch")?.click();
  return true;
};

export const pressClearButton = (): boolean => {
  window.location.href =
    "https://go.westlawjapan.com/wljp/app/search/template/clear?tid=wljpCasesSearchTemplate";
  return true;
};
