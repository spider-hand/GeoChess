import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import { createAppI18n } from "@/i18n";

const renderNavigationFooter = (props: Record<string, unknown> = {}) =>
  render(NavigationFooter, {
    props,
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { getByRole, getByText } = renderNavigationFooter();

  const year = new Date().getFullYear();

  await expect
    .element(getByText(`© ${year} GeoChess All rights reserved.`))
    .toBeInTheDocument();
  await expect
    .element(getByRole("navigation", { name: "Footer navigation" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Privacy" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Terms" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("link", { name: "Contact" }))
    .toHaveAttribute("href", "mailto:creative.spider.hand@gmail.com");
});

it.each([
  { label: "Privacy", prop: "onPrivacyClick" },
  { label: "Terms", prop: "onTermsClick" },
] as const)("should emit the $label action", async ({ label, prop }) => {
  const handler = vi.fn();
  const { getByRole } = renderNavigationFooter({
    [prop]: handler,
  });

  await getByRole("button", { name: label }).click();

  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
});
