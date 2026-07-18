import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import { createAppI18n } from "@/i18n";

vi.mock("@/components/pages/User/AiGamesSection.vue", () => ({
  default: {
    template: '<section data-testid="ai-games-section" />',
  },
}));

vi.mock("@/components/pages/User/UserProfileSection.vue", () => ({
  default: {
    template: '<section data-testid="user-profile-section" />',
  },
}));

vi.mock("@/components/shared/NavigationFooter.vue", () => ({
  default: {
    template: '<footer data-testid="navigation-footer" />',
  },
}));

vi.mock("@/components/shared/NavigationHeader.vue", () => ({
  default: {
    template: '<header data-testid="navigation-header" />',
  },
}));

const UserPage = (await import("@/pages/UserPage.vue")).default;

const renderUserPage = () =>
  render(UserPage, {
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { getByRole } = renderUserPage();

  await expect
    .element(getByRole("tab", { name: "Profile" }))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(getByRole("tab", { name: "AI Games" }))
    .toHaveAttribute("aria-selected", "false");
  await expect
    .element(getByRole("tab", { name: "Friends Games" }))
    .toHaveAttribute("aria-selected", "false");
});

it.each([
  ["AI Games", "Profile"],
  ["Friends Games", "AI Games"],
])("should select %s when it is clicked", async (tabName, inactiveTabName) => {
  const { getByRole } = renderUserPage();

  await getByRole("tab", { name: tabName }).click();

  await expect
    .element(getByRole("tab", { name: tabName }))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(getByRole("tab", { name: inactiveTabName }))
    .toHaveAttribute("aria-selected", "false");
});
