import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import LanguageSelector from "@/components/shared/LanguageSelector.vue";
import { createAppI18n, getStoredLocale, LOCALE_STORAGE_KEY } from "@/i18n";

const nextTick = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
};

const renderLanguageSelector = (
  locale: string | undefined = undefined,
  props: Record<string, unknown> = {},
) =>
  render(LanguageSelector, {
    props,
    global: {
      plugins: [createAppI18n(locale)],
    },
  });

it("should render the default state properly", async () => {
  const { container, getByRole } = renderLanguageSelector();

  await expect
    .element(getByRole("button", { name: "Language" }))
    .toBeInTheDocument();
  expect(container.querySelector('[role="menu"]')).toBeNull();
});

it("should open the menu and render the supported languages", async () => {
  const { getByRole } = renderLanguageSelector();

  await getByRole("button", { name: "Language" }).click();

  await expect.element(getByRole("menu")).toBeInTheDocument();
  await expect
    .element(getByRole("menuitemradio", { name: /English/ }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("menuitemradio", { name: /Español/ }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("menuitemradio", { name: /Deutsch/ }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("menuitemradio", { name: /Français/ }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("menuitemradio", { name: /Português/ }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("menuitemradio", { name: /中文/ }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("menuitemradio", { name: /日本語/ }))
    .toBeInTheDocument();
});

it("should select a language, emit the value, and close the menu", async () => {
  const onSelect = vi.fn();
  const { container, getByRole } = renderLanguageSelector(undefined, {
    onSelect,
  });

  await getByRole("button", { name: "Language" }).click();
  await getByRole("menuitemradio", { name: /日本語/ }).click();

  expect(onSelect).toHaveBeenCalledWith("ja");
  expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ja");
  expect(container.querySelector('[role="menu"]')).toBeNull();
});

it("should restore a saved language", () => {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, "fr");

  expect(getStoredLocale()).toBe("fr");
});

it("should reflect the selected state when reopened", async () => {
  const { getByRole } = renderLanguageSelector("fr");

  await getByRole("button", { name: "Langue" }).click();

  await expect
    .element(getByRole("menuitemradio", { name: /Français/ }))
    .toHaveAttribute("aria-checked", "true");
});

it("should close the menu on outside click", async () => {
  const { container, getByRole } = renderLanguageSelector();

  await getByRole("button", { name: "Language" }).click();
  document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await nextTick();

  expect(container.querySelector('[role="menu"]')).toBeNull();
});

it("should close the menu on escape", async () => {
  const { container, getByRole } = renderLanguageSelector();

  await getByRole("button", { name: "Language" }).click();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  await nextTick();

  expect(container.querySelector('[role="menu"]')).toBeNull();
});
