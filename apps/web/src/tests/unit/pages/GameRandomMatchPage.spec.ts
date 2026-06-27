import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

vi.mock("@/composables/useAuth", () => ({
  signInAnonymouslyIfNeeded: vi.fn().mockResolvedValue({ isAnonymous: true }),
  useAuth: () => ({
    authenticatedUserName: null,
    currentUser: { value: null },
    isAnonymousUser: false,
    isAuthenticatedUser: false,
    isCurrentUserLoaded: true,
    signInAnonymously: vi.fn().mockResolvedValue({ isAnonymous: true }),
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("@/components/pages/Game/GameMap.vue", () => ({
  default: {
    name: "GameMap",
    template: '<div class="game-map" data-testid="game-map" />',
  },
}));

import App from "@/App.vue";
import { createAppI18n } from "@/i18n";
import router from "@/router";

test("renders the game random match page route", async () => {
  await router.push("/game/random-match");
  await router.isReady();

  const { container, getByRole, getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Available Moves" }))
    .toBeInTheDocument();
  await expect.element(getByRole("timer")).toBeInTheDocument();
  expect(container.querySelectorAll(".game-page__map-card-row")).toHaveLength(
    2,
  );
  expect(container.querySelectorAll('[data-testid="game-map"]')).toHaveLength(
    2,
  );
  expect(
    Array.from(container.querySelectorAll("h2")).filter(
      (heading) => heading.textContent === "Path History",
    ),
  ).toHaveLength(2);
  await expect.element(getByText("vs")).toBeInTheDocument();
  await expect.element(getByRole("button", { name: "Select" })).toBeDisabled();
  await expect
    .element(getByRole("navigation", { name: "Footer navigation" }))
    .toBeInTheDocument();
});
