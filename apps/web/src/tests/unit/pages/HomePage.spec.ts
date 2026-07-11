import { beforeEach, expect, it, vi } from "vitest";
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

vi.mock("@/components/pages/Home/PlayVsAiCard.vue", () => ({
  default: {
    name: "PlayVsAiCard",
    props: ["isStartingGame"],
    emits: ["start-ai-match"],
    template:
      '<div data-testid="play-vs-ai-card" :data-is-starting-game="String(isStartingGame)"><button @click="$emit(\'start-ai-match\', \'hard\')">Start mocked AI game</button></div>',
  },
}));

vi.mock("@/components/pages/Home/PlayWithFriendsCard.vue", () => ({
  default: {
    name: "PlayWithFriendsCard",
    props: ["disabled"],
    template:
      '<div data-testid="play-with-friends-card" :data-disabled="String(disabled)" />',
  },
}));

vi.mock("@/components/pages/Home/RandomMatchCard.vue", () => ({
  default: {
    name: "RandomMatchCard",
    props: ["disabled", "onlinePlayers"],
    template:
      '<div data-testid="random-match-card" :data-disabled="String(disabled)" :data-online-players="String(onlinePlayers)" />',
  },
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

it("should render the default state properly", async () => {
  await router.push("/");
  await router.isReady();

  const { container } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  expect(container.querySelector(".home-page__hero-image")).not.toBeNull();
  expect(
    container.querySelector('[data-testid="play-vs-ai-card"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="play-with-friends-card"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="random-match-card"]'),
  ).not.toBeNull();
  expect(
    container
      .querySelector('[data-testid="random-match-card"]')
      ?.getAttribute("data-online-players"),
  ).toBe("40");
});

it("should create an ai game with the selected difficulty and navigate to the game route", async () => {
  mockCreateAiGame.mockResolvedValue({ id: "game-123" });

  await router.push("/");
  await router.isReady();

  const { getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Start mocked AI game" }).click();

  expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
  expect(mockCreateAiGame).toHaveBeenCalledWith({ difficulty: "hard" });
  await expect
    .poll(() => router.currentRoute.value.path)
    .toBe("/game/vs-ai/game-123");
});
