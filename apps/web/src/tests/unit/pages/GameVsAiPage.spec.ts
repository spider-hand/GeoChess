import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { computed, ref } from "vue";

const mockConfetti = vi.fn();
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
const mockCreateAiGame = vi.fn();
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
    props: ["isFinished", "markers"],
    template:
      '<div class="game-map" :data-is-finished="String(isFinished)" :data-markers="JSON.stringify(markers)" data-testid="game-map" />',
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
    createAiGame: (...args: unknown[]) => mockCreateAiGame(...args),
    createAiGameMove: (...args: unknown[]) => mockCreateAiGameMove(...args),
    timeoutAiGame: (...args: unknown[]) => mockTimeoutAiGame(...args),
  }),
}));

vi.mock("canvas-confetti", () => ({
  default: (...args: unknown[]) => mockConfetti(...args),
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
  mockCreateAiGame.mockReset();
  mockCreateAiGameMove.mockReset();
  mockTimeoutAiGame.mockReset();
  mockConfetti.mockReset();
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
  expect(container.querySelector(".result-badge")).toBeNull();
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
      ?.getAttribute("data-is-finished"),
  ).toBe("false");
  expect(
    container
      .querySelector('[data-testid="game-map"]')
      ?.getAttribute("data-markers"),
  ).toBe(
    JSON.stringify([{ countryCode: "BB", owner: "neutral", label: "Start" }]),
  );
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

test("renders the finished loss state with the result card, actions, and visible labels", async () => {
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

  const { container, getByRole, getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect.element(getByText("You Lose")).toBeInTheDocument();
  expect(container.querySelector(".turn-status-strip")).toBeNull();
  await expect
    .element(container.querySelector(".result-badge") as HTMLElement)
    .toBeInTheDocument();
  expect(container.querySelector('[role="timer"]')).toBeNull();
  expect(
    Array.from(container.querySelectorAll("h2")).some(
      (heading) => heading.textContent === "Available Moves",
    ),
  ).toBe(false);
  expect(container.querySelector(".path-history-card")).toBeNull();
  await expect
    .element(
      container
        .querySelectorAll(".path-result-card__turn")
        .item(0) as HTMLElement,
    )
    .toHaveTextContent("Start");
  await expect
    .element(
      container
        .querySelectorAll(".path-result-card__turn")
        .item(1) as HTMLElement,
    )
    .toHaveTextContent("Turn 1");
  expect(
    container
      .querySelector('[data-testid="game-map"]')
      ?.getAttribute("data-is-finished"),
  ).toBe("true");
  expect(
    container
      .querySelector('[data-testid="game-map"]')
      ?.getAttribute("data-markers"),
  ).toBe(
    JSON.stringify([
      { countryCode: "BB", owner: "neutral", label: "Start" },
      { countryCode: "CC", owner: "player", label: "Taylor Swift" },
    ]),
  );
  await expect
    .element(getByRole("button", { name: "Play Again" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Exit" }))
    .toBeInTheDocument();
  expect(mockConfetti).not.toHaveBeenCalled();
});

test("fires confetti once when the page loads in a winning state", async () => {
  realtimeAiGame.value = {
    ...realtimeAiGame.value,
    turn: "ai",
    availableMoves: [],
    moves: {
      "move-1": {
        country: "CC",
        actor: "player",
        createdAt: 1751155250000,
      },
      "move-2": {
        country: "DD",
        actor: "ai",
        createdAt: 1751155300000,
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

  await expect.element(getByText("You Win")).toBeInTheDocument();
  expect(
    container
      .querySelector('[data-testid="game-map"]')
      ?.getAttribute("data-markers"),
  ).toBe(
    JSON.stringify([
      { countryCode: "BB", owner: "neutral", label: "Start" },
      { countryCode: "CC", owner: "player", label: "Taylor Swift" },
      { countryCode: "DD", owner: "ai", label: "AI" },
    ]),
  );
  expect(mockConfetti).toHaveBeenCalledTimes(1);
  expect(mockConfetti).toHaveBeenCalledWith({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
  });
});

test("clicking Play Again creates a new AI game with the same difficulty and navigates to it", async () => {
  realtimeAiGame.value = {
    ...realtimeAiGame.value,
    availableMoves: [],
    difficulty: "medium",
  };
  mockCreateAiGame.mockResolvedValue({ id: "game-456" });

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Play Again" }).click();

  expect(mockCreateAiGame).toHaveBeenCalledWith({ difficulty: "medium" });
  await expect
    .poll(() => router.currentRoute.value.path)
    .toBe("/game/vs-ai/game-456");
});

test("keeps Exit enabled while Play Again is pending", async () => {
  realtimeAiGame.value = {
    ...realtimeAiGame.value,
    availableMoves: [],
  };

  let resolveCreateAiGame: ((value: { id: string }) => void) | null = null;
  mockCreateAiGame.mockImplementation(
    () =>
      new Promise<{ id: string }>((resolve) => {
        resolveCreateAiGame = resolve;
      }),
  );

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  const playAgainButton = getByRole("button", { name: "Play Again" });
  const exitButton = getByRole("button", { name: "Exit" });

  await playAgainButton.click();

  await expect.element(playAgainButton).toBeDisabled();
  await expect.element(exitButton).toBeEnabled();
  expect(mockCreateAiGame).toHaveBeenCalledTimes(1);

  resolveCreateAiGame?.({ id: "game-456" });

  await expect
    .poll(() => router.currentRoute.value.path)
    .toBe("/game/vs-ai/game-456");
});

test("clicking Exit navigates back to the home page", async () => {
  realtimeAiGame.value = {
    ...realtimeAiGame.value,
    availableMoves: [],
  };

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Exit" }).click();

  await expect.poll(() => router.currentRoute.value.path).toBe("/");
});
