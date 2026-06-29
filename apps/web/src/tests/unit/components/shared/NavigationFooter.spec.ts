import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import { createAppI18n } from "@/i18n";

test("renders the footer credit and actions", async () => {
  const { getByRole, getByText } = render(NavigationFooter, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  const year = new Date().getFullYear();

  await expect
    .element(getByText(`© ${year} GeoChess All rights reserved.`))
    .toBeInTheDocument();
  await expect
    .element(getByRole("navigation", { name: "Footer navigation" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "GitHub" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Discord" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Privacy" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Terms" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Contact" }))
    .toBeInTheDocument();
});

test("emits explicit events for each footer action", async () => {
  const onGithubClick = vi.fn();
  const onDiscordClick = vi.fn();
  const onPrivacyClick = vi.fn();
  const onTermsClick = vi.fn();
  const onContactClick = vi.fn();

  const { getByRole } = render(NavigationFooter, {
    props: {
      onGithubClick,
      onDiscordClick,
      onPrivacyClick,
      onTermsClick,
      onContactClick,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "GitHub" }).click();
  await getByRole("button", { name: "Discord" }).click();
  await getByRole("button", { name: "Privacy" }).click();
  await getByRole("button", { name: "Terms" }).click();
  await getByRole("button", { name: "Contact" }).click();

  expect(onGithubClick).toHaveBeenCalledTimes(1);
  expect(onDiscordClick).toHaveBeenCalledTimes(1);
  expect(onPrivacyClick).toHaveBeenCalledTimes(1);
  expect(onTermsClick).toHaveBeenCalledTimes(1);
  expect(onContactClick).toHaveBeenCalledTimes(1);
});
