import { beforeEach, expect, it, vi } from "vitest";
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
const userCountry = ref<string | undefined>(undefined);
const isAnonymousUser = ref(false);
const mockCreateAiGame = vi.fn();
const mockCreateAiGameMove = vi.fn();

vi.mock("@/composables/useAuth", () => ({
  signInAnonymouslyIfNeeded: vi.fn().mockResolvedValue({ isAnonymous: true }),
  useAuth: () => ({
    username: computed(() => username.value),
    userCountry: computed(() => userCountry.value),
    currentUser: { value: null },
    isAnonymousUser: computed(() => isAnonymousUser.value),
    isAuthenticatedUser: false,
    isCurrentUserLoaded: true,
    signInAnonymously: vi.fn().mockResolvedValue({ isAnonymous: true }),
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("@/components/pages/Game/PlayerMatchupCard.vue", () => ({
  default: {
    name: "PlayerMatchupCard",
    props: ["playerOne", "playerTwo"],
    template:
      '<div data-testid="player-matchup-card" :data-player-one-name="playerOne?.name ?? \'\'" :data-player-one-country="playerOne?.country ?? \'\'" :data-player-two-name="playerTwo?.name ?? \'\'" />',
  },
}));

vi.mock("@/components/pages/Game/TurnStatusStrip.vue", () => ({
  default: {
    name: "TurnStatusStrip",
    props: ["status", "currentTurn"],
    template:
      '<div data-testid="turn-status-strip" :data-status="status" :data-current-turn="String(currentTurn)" />',
  },
}));

vi.mock("@/components/pages/Game/ResultBadge.vue", () => ({
  default: {
    name: "ResultBadge",
    props: ["result"],
    template: '<div data-testid="result-badge" :data-result="result" />',
  },
}));

vi.mock("@/components/pages/Game/CountdownTimer.vue", () => ({
  default: {
    name: "CountdownTimer",
    props: ["startedAtMs"],
    template: '<div data-testid="countdown-timer" />',
  },
}));

vi.mock("@/components/pages/Game/GameMap.vue", () => ({
  default: {
    name: "GameMap",
    props: ["isFinished", "markers"],
    template:
      '<div data-testid="game-map" :data-is-finished="String(isFinished)" :data-markers="JSON.stringify(markers)" />',
  },
}));

vi.mock("@/components/pages/Game/AvailableMovesCard.vue", () => ({
  default: {
    name: "AvailableMovesCard",
    props: ["availableMoves", "isAiTurn", "isSelecting", "isSelectDisabled"],
    emits: ["select"],
    template:
      '<div data-testid="available-moves-card" :data-moves="String(availableMoves.length)" :data-is-ai-turn="String(isAiTurn)" :data-is-selecting="String(isSelecting)" :data-is-select-disabled="String(isSelectDisabled)" />',
  },
}));

vi.mock("@/components/pages/Game/PathResultCard.vue", () => ({
  default: {
    name: "PathResultCard",
    props: ["resultSteps"],
    template:
      '<div data-testid="path-result-card" :data-steps="String(resultSteps.length)" />',
  },
}));

vi.mock("@/components/pages/Game/PathHistoryCard.vue", () => ({
  default: {
    name: "PathHistoryCard",
    props: ["historySteps"],
    template:
      '<div data-testid="path-history-card" :data-steps="String(historySteps.length)" />',
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
  userCountry.value = undefined;
  isAnonymousUser.value = false;
  mockCreateAiGame.mockReset();
  mockCreateAiGameMove.mockReset();
  mockConfetti.mockReset();
});

it("should render the active game layout for the default state", async () => {
  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { container } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  expect(
    container.querySelector('[data-testid="player-matchup-card"]'),
  ).not.toBeNull();
  expect(
    container
      .querySelector('[data-testid="player-matchup-card"]')
      ?.getAttribute("data-player-one-country"),
  ).toBe("");
  expect(
    container.querySelector('[data-testid="turn-status-strip"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="countdown-timer"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="available-moves-card"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="path-history-card"]'),
  ).not.toBeNull();
  expect(container.querySelector('[data-testid="result-badge"]')).toBeNull();
  expect(
    container.querySelector('[data-testid="path-result-card"]'),
  ).toBeNull();
  expect(
    container
      .querySelector('[data-testid="game-map"]')
      ?.getAttribute("data-is-finished"),
  ).toBe("false");
});

it("should pass the ai-turn state to the active game controls", async () => {
  realtimeAiGame.value = {
    ...realtimeAiGame.value,
    turn: "ai",
    availableMoves: ["CC", "DD"],
    updatedAt: 1751155260000,
  };

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { container } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  expect(
    container
      .querySelector('[data-testid="turn-status-strip"]')
      ?.getAttribute("data-status"),
  ).toBe("ai");
  expect(
    container
      .querySelector('[data-testid="available-moves-card"]')
      ?.getAttribute("data-is-ai-turn"),
  ).toBe("true");
  expect(
    container
      .querySelector('[data-testid="available-moves-card"]')
      ?.getAttribute("data-is-select-disabled"),
  ).toBe("true");
});

it("should render the finished loss layout with replay actions", async () => {
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

  const { container, getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  expect(
    container.querySelector('[data-testid="turn-status-strip"]'),
  ).toBeNull();
  expect(container.querySelector('[data-testid="countdown-timer"]')).toBeNull();
  expect(
    container.querySelector('[data-testid="available-moves-card"]'),
  ).toBeNull();
  expect(
    container.querySelector('[data-testid="path-history-card"]'),
  ).toBeNull();
  expect(
    container.querySelector('[data-testid="path-result-card"]'),
  ).not.toBeNull();
  expect(
    container
      .querySelector('[data-testid="result-badge"]')
      ?.getAttribute("data-result"),
  ).toBe("lost");
  expect(
    container
      .querySelector('[data-testid="game-map"]')
      ?.getAttribute("data-is-finished"),
  ).toBe("true");
  await expect
    .element(getByRole("button", { name: "Play Again" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Exit" }))
    .toBeInTheDocument();
  expect(mockConfetti).not.toHaveBeenCalled();
});

it("should fire confetti once when the page loads in a winning state", async () => {
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

  const { container } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  expect(
    container
      .querySelector('[data-testid="result-badge"]')
      ?.getAttribute("data-result"),
  ).toBe("won");
  expect(mockConfetti).toHaveBeenCalledTimes(1);
  expect(mockConfetti).toHaveBeenCalledWith({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
  });
});

it("should create a new ai game with the same difficulty when Play Again is clicked", async () => {
  realtimeAiGame.value = {
    ...realtimeAiGame.value,
    availableMoves: [],
    difficulty: "medium",
  };

  let finishCreateAiGame!: (value: { id: string }) => void;
  mockCreateAiGame.mockImplementation(
    () =>
      new Promise<{ id: string }>((resolve) => {
        finishCreateAiGame = (value) => resolve(value);
      }),
  );

  await router.push("/game/vs-ai/game-123");
  await router.isReady();

  const { getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Play Again" }).click();

  expect(mockCreateAiGame).toHaveBeenCalledTimes(1);
  expect(mockCreateAiGame).toHaveBeenCalledWith({ difficulty: "medium" });

  finishCreateAiGame({ id: "game-456" });

  await expect
    .poll(() => router.currentRoute.value.path)
    .toBe("/game/vs-ai/game-456");
});

it("should navigate back to the home page when Exit is clicked", async () => {
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
