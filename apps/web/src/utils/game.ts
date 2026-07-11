import countryNames from "@/constants/countryNames";

const SUPPORTED_COUNTRY_NAME_LOCALES = new Set([
  "de",
  "en",
  "es",
  "fr",
  "ja",
  "pt",
  "zh",
] as const);

type CountryNameLocale = keyof (typeof countryNames)[keyof typeof countryNames];

const supportedCountryNameLocale = (locale: string): CountryNameLocale => {
  return SUPPORTED_COUNTRY_NAME_LOCALES.has(locale as CountryNameLocale)
    ? (locale as CountryNameLocale)
    : "en";
};

export const countryFlagSrc = (countryCode: string) => {
  return `/flags/${countryCode.toLowerCase()}.webp`;
};

export const countryDisplayCode = (countryCode: string) => {
  return countryCode.toUpperCase();
};

export const countryDisplayName = (countryCode: string, locale: string) => {
  return countryNames[countryCode.toLowerCase() as keyof typeof countryNames]?.[
    supportedCountryNameLocale(locale)
  ];
};

export const countryDisplayLabel = (countryCode: string, locale: string) => {
  const displayCode = countryDisplayCode(countryCode);
  const localizedName = countryDisplayName(countryCode, locale);

  return localizedName ? `${localizedName} ${displayCode}` : displayCode;
};
