import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { ref } from "vue";

const realtimeAiGame = ref({
  id: "game-123",
  userId: "user-123",
  difficulty: "medium",
  turn: 1,
  country: "BB",
  borders: ["CC"],
  usedCountries: ["BB"],
  moves: [],
  createdAt: new Date("2026-06-29T00:00:00Z"),
  updatedAt: new Date("2026-06-29T00:00:00Z"),
});
const realtimeAiGameError = ref<Error | null>(null);
const isLoadingRealtimeAiGame = ref(false);

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

vi.mock("@/composables/useRealtimeAiGame", () => ({
  default: () => ({
    realtimeAiGame,
    realtimeAiGameError,
    isLoadingRealtimeAiGame,
  }),
}));

vi.mock("@/composables/useAiGameQuery", () => ({
  default: () => ({
    createAiGame: vi.fn(),
  }),
}));

import App from "@/App.vue";
import { createAppI18n } from "@/i18n";
import router from "@/router";

beforeEach(() => {
  realtimeAiGame.value = {
    id: "game-123",
    userId: "user-123",
    difficulty: "medium",
    turn: 1,
    country: "BB",
    borders: ["CC"],
    usedCountries: ["BB"],
    moves: [],
    createdAt: new Date("2026-06-29T00:00:00Z"),
    updatedAt: new Date("2026-06-29T00:00:00Z"),
  };
  realtimeAiGameError.value = null;
  isLoadingRealtimeAiGame.value = false;
});

test("renders the game vs ai page route", async () => {
  await router.push("/game/vs-ai/game-123");
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

test("redirects home when the game session is missing", async () => {
  realtimeAiGame.value = null;

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect.poll(() => router.currentRoute.value.path).toBe("/");
});
