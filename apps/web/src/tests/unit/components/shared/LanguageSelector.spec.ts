import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import { createAppI18n } from "../../../../i18n";
import LanguageSelector from "../../../../components/shared/LanguageSelector.vue";

const nextTick = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
};

test("is closed by default", async () => {
  const { getByRole, container } = render(LanguageSelector, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "Language" }))
    .toBeInTheDocument();
  expect(container.querySelector('[role="menu"]')).toBeNull();
});

test("opens and renders the supported languages", async () => {
  const { getByRole } = render(LanguageSelector, {
    global: {
      plugins: [createAppI18n()],
    },
  });

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

test("selects a language, emits the value, and closes the menu", async () => {
  const onSelect = vi.fn();
  const { getByRole, container } = render(LanguageSelector, {
    props: {
      onSelect,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Language" }).click();
  await getByRole("menuitemradio", { name: /日本語/ }).click();

  expect(onSelect).toHaveBeenCalledWith("ja");
  expect(container.querySelector('[role="menu"]')).toBeNull();
});

test("reflects the selected state when reopened", async () => {
  const { getByRole } = render(LanguageSelector, {
    global: {
      plugins: [createAppI18n("fr")],
    },
  });

  await getByRole("button", { name: "Langue" }).click();

  await expect
    .element(getByRole("menuitemradio", { name: /Français/ }))
    .toHaveAttribute("aria-checked", "true");
});

test("closes on outside click and escape", async () => {
  const { getByRole, container } = render(LanguageSelector, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Language" }).click();
  await expect.element(getByRole("menu")).toBeInTheDocument();

  document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await nextTick();
  expect(container.querySelector('[role="menu"]')).toBeNull();

  await getByRole("button", { name: "Language" }).click();
  await expect.element(getByRole("menu")).toBeInTheDocument();

  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  await nextTick();
  expect(container.querySelector('[role="menu"]')).toBeNull();
});
