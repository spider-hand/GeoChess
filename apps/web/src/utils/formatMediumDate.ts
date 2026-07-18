export const formatMediumDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
