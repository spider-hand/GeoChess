import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { ref } from "vue";

const mockCreateAiGame = vi.fn();
const mockSignInAnonymously = vi.fn();
const realtimeAiGame = ref({
  id: "game-123",
  userId: "user-123",
  difficulty: "medium",
  turn: "player",
  start: "BB",
  country: "BB",
  availableMoves: ["CC"],
  usedCountries: ["BB"],
  moves: {},
  createdAt: 1751155200000,
  updatedAt: 1751155200000,
});
const realtimeAiGameError = ref<Error | null>(null);
const isLoadingRealtimeAiGame = ref(false);

vi.mock("@/composables/useAuth", () => ({
  signInAnonymouslyIfNeeded: vi.fn().mockResolvedValue({ isAnonymous: true }),
  useAuth: () => ({
    username: "Guest",
    currentUser: { value: null },
    isAnonymousUser: false,
    isAuthenticatedUser: false,
    isCurrentUserLoaded: true,
    signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("@/composables/useAiGameQuery", () => ({
  default: () => ({
    createAiGame: (...args: unknown[]) => mockCreateAiGame(...args),
    timeoutAiGame: vi.fn(),
  }),
}));

vi.mock("@/composables/useRealtimeAiGame", () => ({
  default: () => ({
    realtimeAiGame,
    realtimeAiGameError,
    isLoadingRealtimeAiGame,
  }),
}));

import App from "@/App.vue";
import { createAppI18n } from "@/i18n";
import router from "@/router";

beforeEach(() => {
  mockCreateAiGame.mockReset();
  mockSignInAnonymously.mockReset();
  mockSignInAnonymously.mockResolvedValue({ isAnonymous: true });
  realtimeAiGame.value = {
    id: "game-123",
    userId: "user-123",
    difficulty: "medium",
    turn: "player",
    start: "BB",
    country: "BB",
    availableMoves: ["CC"],
    usedCountries: ["BB"],
    moves: {},
    createdAt: 1751155200000,
    updatedAt: 1751155200000,
  };
  realtimeAiGameError.value = null;
  isLoadingRealtimeAiGame.value = false;
});

test("renders the home page for the root route", async () => {
  await router.push("/");
  await router.isReady();

  const { getByRole, getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect
    .element(getByRole("button", { name: "GeoChess" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Language settings" }))
    .toBeInTheDocument();
  await expect
    .element(
      getByText(`© ${new Date().getFullYear()} GeoChess All rights reserved.`),
    )
    .toBeInTheDocument();
  await expect
    .element(getByRole("navigation", { name: "Footer navigation" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "GitHub", exact: true }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("heading", { name: "Play vs AI" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Medium" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Start Game" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("heading", { name: "Play with Friends" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Create Room" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Enter Room" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("heading", { name: "Random Match" }))
    .toBeInTheDocument();
  await expect.element(getByText("40 players online")).toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Join Lobby" }))
    .toBeInTheDocument();
});

test("creates an ai game with the selected difficulty and navigates to the game route", async () => {
  mockCreateAiGame.mockResolvedValue({ id: "game-123" });

  await router.push("/");
  await router.isReady();

  const { getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Hard" }).click();
  await getByRole("button", { name: "Start Game" }).click();

  expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
  expect(mockCreateAiGame).toHaveBeenCalledWith({ difficulty: "hard" });
  await expect
    .poll(() => router.currentRoute.value.path)
    .toBe("/game/vs-ai/game-123");
});
