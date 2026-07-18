import { createMemoryHistory, createRouter } from "vue-router";
import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import { createAppI18n } from "@/i18n";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/privacy", component: { template: "<div />" } },
    { path: "/terms", component: { template: "<div />" } },
  ],
});

const renderNavigationFooter = () =>
  render(NavigationFooter, {
    global: {
      plugins: [createAppI18n(), router],
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
    .element(getByRole("link", { name: "Privacy" }))
    .toHaveAttribute("href", "/privacy");
  await expect
    .element(getByRole("link", { name: "Terms" }))
    .toHaveAttribute("href", "/terms");
  await expect
    .element(getByRole("link", { name: "Contact" }))
    .toHaveAttribute("href", "mailto:creative.spider.hand@gmail.com");
});
