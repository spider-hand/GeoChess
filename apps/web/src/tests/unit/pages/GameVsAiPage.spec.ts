import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { computed, ref } from "vue";

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
const username = ref<string | null>("Taylor Swift");
const isAnonymousUser = ref(false);
const mockCreateAiGameMove = vi.fn();
const mockTimeoutAiGame = vi.fn();

vi.mock("@/composables/useAuth", () => ({
  signInAnonymouslyIfNeeded: vi.fn().mockResolvedValue({ isAnonymous: true }),
  useAuth: () => ({
    username: computed(() => username.value),
    currentUser: { value: null },
    isAnonymousUser: computed(() => isAnonymousUser.value),
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
    props: ["showPlaceLabels"],
    template:
      '<div class="game-map" :data-show-place-labels="String(showPlaceLabels)" data-testid="game-map" />',
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
    createAiGameMove: (...args: unknown[]) => mockCreateAiGameMove(...args),
    timeoutAiGame: (...args: unknown[]) => mockTimeoutAiGame(...args),
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
  username.value = "Taylor Swift";
  isAnonymousUser.value = false;
  mockCreateAiGameMove.mockReset();
  mockTimeoutAiGame.mockReset();
});

test("renders the in-game player turn layout from realtime state", async () => {
  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { container, getByRole, getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect.element(getByText("Taylor Swift")).toBeInTheDocument();
  await expect
    .element(
      container
        .querySelectorAll(".player-matchup-card__name")
        .item(1) as HTMLElement,
    )
    .toHaveTextContent("AI");
  await expect.element(getByText("Your Turn")).toBeInTheDocument();
  await expect
    .element(container.querySelector(".turn-status-strip__turn") as HTMLElement)
    .toHaveTextContent("Turn 1");
  await expect
    .element(getByRole("heading", { name: "Available Moves" }))
    .toBeInTheDocument();
  await expect.element(getByRole("timer")).toBeInTheDocument();
  await expect
    .element(getByRole("heading", { name: "Path History" }))
    .toBeInTheDocument();
  expect(container.querySelectorAll('[data-testid="game-map"]')).toHaveLength(
    1,
  );
  expect(
    container
      .querySelector('[data-testid="game-map"]')
      ?.getAttribute("data-show-place-labels"),
  ).toBe("false");
});

test("renders the AI waiting state and keeps the timer visible", async () => {
  realtimeAiGame.value = {
    ...realtimeAiGame.value,
    turn: "ai",
    availableMoves: ["CC", "DD"],
    updatedAt: 1751155260000,
  };

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { getByLabelText, getByRole, getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect.element(getByText("AI Turn")).toBeInTheDocument();
  await expect.element(getByLabelText("AI is choosing")).toBeVisible();
  await expect.element(getByRole("button", { name: "Select" })).toBeDisabled();
  await expect.element(getByRole("timer")).toBeInTheDocument();
});

test("renders the finished loss state with the result card and visible labels", async () => {
  realtimeAiGame.value = {
    ...realtimeAiGame.value,
    availableMoves: [],
    moves: {
      "move-1": {
        country: "CC",
        actor: "player",
        createdAt: 1751155250000,
      },
    },
  };

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { container, getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect.element(getByText("You Lose")).toBeInTheDocument();
  expect(container.querySelector('[role="timer"]')).toBeNull();
  expect(
    Array.from(container.querySelectorAll("h2")).some(
      (heading) => heading.textContent === "Available Moves",
    ),
  ).toBe(false);
  await expect.element(getByText("Turn 2")).toBeInTheDocument();
  expect(
    container
      .querySelector('[data-testid="game-map"]')
      ?.getAttribute("data-show-place-labels"),
  ).toBe("true");
});
