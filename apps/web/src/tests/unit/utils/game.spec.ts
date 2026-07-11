import { expect, it } from "vitest";

import {
  countryDisplayCode,
  countryDisplayLabel,
  countryDisplayName,
  countryFlagSrc,
} from "@/utils/game";

it.each([
  { countryCode: "JP", expected: "/flags/jp.webp" },
  { countryCode: "us", expected: "/flags/us.webp" },
])(
  "should build the flag asset path for $countryCode",
  ({ countryCode, expected }) => {
    expect(countryFlagSrc(countryCode)).toBe(expected);
  },
);

it.each([
  { countryCode: "jp", expected: "JP" },
  { countryCode: "Us", expected: "US" },
])(
  "should normalize the country display code for $countryCode",
  ({ countryCode, expected }) => {
    expect(countryDisplayCode(countryCode)).toBe(expected);
  },
);

it("should return the localized country name for a supported locale", () => {
  expect(countryDisplayName("jp", "ja")).toBe("日本");
});

it("should fall back to the english country name for an unsupported locale", () => {
  expect(countryDisplayName("jp", "ko")).toBe("Japan");
});

it("should return undefined when the country code is unknown", () => {
  expect(countryDisplayName("zz", "en")).toBeUndefined();
});

it("should include the localized country name and display code in the label when the country is known", () => {
  expect(countryDisplayLabel("jp", "ja")).toBe("日本 JP");
});

it("should fall back to the display code in the label when the country is unknown", () => {
  expect(countryDisplayLabel("zz", "en")).toBe("ZZ");
});
