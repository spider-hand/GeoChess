import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { computed, ref } from "vue";

const mockConfetti = vi.fn();
const mockQueryClient = { invalidateQueries: vi.fn() };
const currentUser = ref<null | { uid: string; isAnonymous: boolean }>(null);
const isCurrentUserLoaded = ref(true);
const username = ref("Taylor Swift");
const userCountry = ref<string | undefined>(undefined);
const realtimeWithFriendsGame = ref({
  id: "game-123",
  roomKey: "654321",
  player1UserId: "user-123",
  player2UserId: "user-456",
  participants: {
    player1: "user-123",
    player2: "user-456",
  },
  status: "active",
  turn: "player1",
  start: "BB",
  country: "BB",
  availableMoves: ["CC"],
  usedCountries: ["BB"],
  moves: {},
  createdAt: 1751155200000,
  updatedAt: 1751155200000,
});
const realtimeWithFriendsGameError = ref<Error | null>(null);
const isLoadingRealtimeWithFriendsGame = ref(false);
const mockCreateWithFriendsGame = vi.fn();
const mockCreateWithFriendsGameMove = vi.fn();
const mockGetUser = vi.fn();
const mockCreateAiGame = vi.fn();
const mockRouterCurrentUser = vi.fn();

vi.mock("vuefire", async () => {
  const actual = await vi.importActual<typeof import("vuefire")>("vuefire");

  return {
    ...actual,
    getCurrentUser: (...args: unknown[]) => mockRouterCurrentUser(...args),
  };
});

vi.mock("@/composables/useAuth", () => ({
  signInAnonymouslyIfNeeded: vi.fn().mockResolvedValue({ isAnonymous: true }),
  useAuth: () => ({
    username: computed(() => username.value),
    userCountry: computed(() => userCountry.value),
    currentUser,
    isAnonymousUser: computed(() => currentUser.value?.isAnonymous ?? false),
    isAuthenticatedUser: computed(() => currentUser.value !== null),
    isRegisteredUser: computed(
      () => !!currentUser.value && !currentUser.value.isAnonymous,
    ),
    isCurrentUserLoaded,
    signInAnonymously: vi.fn().mockResolvedValue({ isAnonymous: true }),
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("@/composables/useRealtimeWithFriendsGame", () => ({
  default: () => ({
    realtimeWithFriendsGame,
    realtimeWithFriendsGameError,
    isLoadingRealtimeWithFriendsGame,
  }),
}));

vi.mock("@/composables/useWithFriendsGameQuery", () => ({
  default: () => ({
    createWithFriendsGame: (...args: unknown[]) =>
      mockCreateWithFriendsGame(...args),
    createWithFriendsGameMove: (...args: unknown[]) =>
      mockCreateWithFriendsGameMove(...args),
  }),
}));

vi.mock("@/composables/useUserApi", () => ({
  default: () => ({
    getUser: (...args: unknown[]) => mockGetUser(...args),
  }),
}));

vi.mock("@/composables/useAiGameQuery", () => ({
  default: () => ({
    createAiGame: (...args: unknown[]) => mockCreateAiGame(...args),
  }),
}));

vi.mock("canvas-confetti", () => ({
  default: (...args: unknown[]) => mockConfetti(...args),
}));

vi.mock("@tanstack/vue-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/vue-query")>(
    "@tanstack/vue-query",
  );

  return {
    ...actual,
    useQueryClient: () => mockQueryClient,
  };
});

vi.mock("@/pages/HomePage.vue", () => ({
  default: {
    name: "HomePage",
    template: '<div data-testid="home-page" />',
  },
}));

vi.mock("@/components/shared/Button.vue", () => ({
  default: {
    name: "Button",
    props: ["loading", "variant"],
    emits: ["click"],
    template:
      '<button :data-loading="String(loading)" :data-variant="variant ?? \'primary\'" @click="$emit(\'click\')"><slot /></button>',
  },
}));

vi.mock("@/components/pages/Game/PlayerMatchupCard.vue", () => ({
  default: {
    name: "PlayerMatchupCard",
    props: ["playerOne", "playerTwo"],
    template:
      '<div data-testid="player-matchup-card" :data-player-one-name="playerOne?.name ?? \'\'" :data-player-one-country="playerOne?.country ?? \'\'" :data-player-two-name="playerTwo?.name ?? \'\'" :data-player-two-country="playerTwo?.country ?? \'\'" />',
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

vi.mock("@/components/pages/Game/RoomKeyStrip.vue", () => ({
  default: {
    name: "RoomKeyStrip",
    props: ["roomKey"],
    template: '<div data-testid="room-key-strip" :data-room-key="roomKey" />',
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
    props: [
      "availableMoves",
      "isVsAiGame",
      "isPlayerTurn",
      "isGameReady",
      "isSelecting",
      "isSelectDisabled",
    ],
    emits: ["select"],
    template:
      '<div data-testid="available-moves-card" :data-moves="String(availableMoves.length)" :data-is-vs-ai-game="String(isVsAiGame)" :data-is-player-turn="String(isPlayerTurn)" :data-is-game-ready="String(isGameReady)" :data-is-selecting="String(isSelecting)" :data-is-select-disabled="String(isSelectDisabled)" />',
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
    props: ["historySteps", "isGameReady"],
    template:
      '<div data-testid="path-history-card" :data-steps="String(historySteps.length)" :data-is-game-ready="String(isGameReady)" />',
  },
}));

import App from "@/App.vue";
import { createAppI18n } from "@/i18n";
import router from "@/router";

beforeEach(() => {
  currentUser.value = { uid: "user-123", isAnonymous: false };
  isCurrentUserLoaded.value = true;
  username.value = "Taylor Swift";
  userCountry.value = undefined;
  realtimeWithFriendsGame.value = {
    id: "game-123",
    roomKey: "654321",
    player1UserId: "user-123",
    player2UserId: "user-456",
    participants: {
      player1: "user-123",
      player2: "user-456",
    },
    status: "active",
    turn: "player1",
    start: "BB",
    country: "BB",
    availableMoves: ["CC"],
    usedCountries: ["BB"],
    moves: {},
    createdAt: 1751155200000,
    updatedAt: 1751155200000,
  };
  realtimeWithFriendsGameError.value = null;
  isLoadingRealtimeWithFriendsGame.value = false;
  mockCreateWithFriendsGame.mockReset();
  mockCreateWithFriendsGameMove.mockReset();
  mockGetUser.mockReset();
  mockCreateAiGame.mockReset();
  mockConfetti.mockReset();
  mockRouterCurrentUser.mockReset();
  mockRouterCurrentUser.mockResolvedValue({
    uid: "user-123",
    isAnonymous: false,
  });
  mockGetUser.mockResolvedValue({
    userId: "user-456",
    displayName: "Selena Gomez",
    country: "US",
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
  });
});

it("should render the active game layout for player1", async () => {
  await router.push("/game/with-friends/game-123");
  await router.isReady();

  const { container } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect
    .poll(() =>
      container
        .querySelector('[data-testid="player-matchup-card"]')
        ?.getAttribute("data-player-two-name"),
    )
    .toBe("Selena Gomez");
  expect(
    container.querySelector('[data-testid="turn-status-strip"]'),
  ).not.toBeNull();
  expect(container.querySelector('[data-testid="room-key-strip"]')).toBeNull();
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

it("should show a loader while the game is loading", async () => {
  realtimeWithFriendsGame.value = null as never;
  isLoadingRealtimeWithFriendsGame.value = true;

  await router.push("/game/with-friends/game-123");
  await router.isReady();

  const { container } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  expect(container.querySelector(".game-page__loader")).not.toBeNull();
});

it.each(["waiting", "starting"] as const)(
  "should not show countdown timer, player matchup card, and turn status strip when the game is not active",
  async (status) => {
    realtimeWithFriendsGame.value = {
      ...realtimeWithFriendsGame.value,
      status,
    };

    await router.push("/game/with-friends/game-123");
    await router.isReady();

    const { container } = render(App, {
      global: {
        plugins: [createAppI18n(), router],
      },
    });

    expect(
      container.querySelector('[data-testid="player-matchup-card"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="turn-status-strip"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="countdown-timer"]'),
    ).toBeNull();
    expect(
      container
        .querySelector('[data-testid="room-key-strip"]')
        ?.getAttribute("data-room-key"),
    ).toBe("654321");
  },
);

it("should show the starting message when the game is about to start", async () => {
  realtimeWithFriendsGame.value = {
    ...realtimeWithFriendsGame.value,
    status: "starting",
  };

  await router.push("/game/with-friends/game-123");
  await router.isReady();

  const { getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect
    .element(getByText("The game is ready and will start shortly."))
    .toBeVisible();
});

it("should show the waiting message while waiting for the opponent", async () => {
  realtimeWithFriendsGame.value = {
    ...realtimeWithFriendsGame.value,
    status: "waiting",
  };

  await router.push("/game/with-friends/game-123");
  await router.isReady();

  const { getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect.element(getByText("Waiting for opponent")).toBeVisible();
});

it("should render opponent information from the user endpoint", async () => {
  userCountry.value = "JP";

  await router.push("/game/with-friends/game-123");
  await router.isReady();

  const { container } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect
    .poll(() =>
      container
        .querySelector('[data-testid="player-matchup-card"]')
        ?.getAttribute("data-player-two-country"),
    )
    .toBe("US");
  expect(
    container
      .querySelector('[data-testid="player-matchup-card"]')
      ?.getAttribute("data-player-one-country"),
  ).toBe("JP");
});

it("should disable move selection when it is the opponent turn", async () => {
  realtimeWithFriendsGame.value = {
    ...realtimeWithFriendsGame.value,
    turn: "player2",
    availableMoves: ["CC", "DD"],
    updatedAt: 1751155260000,
  };

  await router.push("/game/with-friends/game-123");
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
  ).toBe("opponent");
  expect(
    container
      .querySelector('[data-testid="available-moves-card"]')
      ?.getAttribute("data-is-vs-ai-game"),
  ).toBe("false");
  expect(
    container
      .querySelector('[data-testid="available-moves-card"]')
      ?.getAttribute("data-is-player-turn"),
  ).toBe("false");
  expect(
    container
      .querySelector('[data-testid="available-moves-card"]')
      ?.getAttribute("data-is-game-ready"),
  ).toBe("true");
  expect(
    container
      .querySelector('[data-testid="path-history-card"]')
      ?.getAttribute("data-is-game-ready"),
  ).toBe("true");
  expect(
    container
      .querySelector('[data-testid="available-moves-card"]')
      ?.getAttribute("data-is-select-disabled"),
  ).toBe("true");
});

it("should show Create Room and Exit for player1 after the game finishes", async () => {
  realtimeWithFriendsGame.value = {
    ...realtimeWithFriendsGame.value,
    status: "finished",
    availableMoves: [],
    turn: "player2",
    moves: {
      "move-1": {
        country: "CC",
        actor: "player1",
        createdAt: 1751155250000,
      },
    },
  };
  mockCreateWithFriendsGame.mockResolvedValue({
    id: "new-game-456",
    roomKey: "222333",
  });

  await router.push("/game/with-friends/game-123");
  await router.isReady();

  const { container, getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

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
    container.querySelector('[data-testid="result-badge"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="path-result-card"]'),
  ).not.toBeNull();

  await getByRole("button", { name: "Create Room" }).click();

  await expect.poll(() => mockCreateWithFriendsGame.mock.calls.length).toBe(1);
  await expect
    .poll(() => router.currentRoute.value.path)
    .toBe("/game/with-friends/new-game-456");
  expect(container.querySelectorAll("button").length).toBeGreaterThanOrEqual(2);
});

it("should show only Exit for player2 after the game finishes", async () => {
  currentUser.value = { uid: "user-456", isAnonymous: false };
  realtimeWithFriendsGame.value = {
    ...realtimeWithFriendsGame.value,
    status: "finished",
    availableMoves: [],
    turn: "player2",
  };

  await router.push("/game/with-friends/game-123");
  await router.isReady();

  const { container, getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect.element(getByRole("button", { name: "Exit" })).toBeVisible();
  expect(container.textContent).not.toContain("Create Room");
});

it("should trigger confetti when player1 wins", async () => {
  realtimeWithFriendsGame.value = {
    ...realtimeWithFriendsGame.value,
    status: "finished",
    availableMoves: [],
    turn: "player2",
  };

  await router.push("/game/with-friends/game-123");
  await router.isReady();

  render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  expect(mockConfetti).toHaveBeenCalledTimes(1);
});

it("should navigate home when realtime game loading fails or the user is not a participant", async () => {
  currentUser.value = { uid: "outsider", isAnonymous: false };

  await router.push("/game/with-friends/game-123");
  await router.isReady();

  render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect.poll(() => router.currentRoute.value.path).toBe("/");
});
