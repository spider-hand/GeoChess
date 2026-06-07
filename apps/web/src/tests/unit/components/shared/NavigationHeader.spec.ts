import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import { createAppI18n } from "../../../../i18n";
import NavigationHeader from "../../../../components/shared/NavigationHeader.vue";

test("renders the product name and controls", async () => {
  const { getByRole } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "GeoChess" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Github repository link" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Language settings" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Sign Up" }))
    .toBeInTheDocument();
});

test("emits branch events for each action", async () => {
  const onBrandClick = vi.fn();
  const onHowToPlayClick = vi.fn();
  const onGithubClick = vi.fn();
  const onLanguageSelect = vi.fn();
  const onSignUpClick = vi.fn();

  const { getByRole } = render(NavigationHeader, {
    props: {
      onBrandClick,
      onHowToPlayClick,
      onGithubClick,
      onLanguageSelect,
      onSignUpClick,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "GeoChess" }).click();
  await getByRole("button", { name: "How to play" }).click();
  await getByRole("button", { name: "Github repository link" }).click();
  await getByRole("button", { name: "Sign Up" }).click();
  await getByRole("button", { name: "Language settings" }).click();
  await getByRole("menuitemradio", { name: /日本語/ }).click();

  expect(onBrandClick).toHaveBeenCalledTimes(1);
  expect(onHowToPlayClick).toHaveBeenCalledTimes(1);
  expect(onGithubClick).toHaveBeenCalledTimes(1);
  expect(onLanguageSelect).toHaveBeenCalledWith("ja");
  expect(onSignUpClick).toHaveBeenCalledTimes(1);
});

test("composes the shared button branches for the text actions", async () => {
  const { getByRole } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toHaveClass("button--tertiary");
  await expect
    .element(getByRole("button", { name: "Sign Up" }))
    .toHaveClass("button--primary", "button--pill");
});
