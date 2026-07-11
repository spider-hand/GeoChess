import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

vi.mock("@/composables/useAuth", () => ({
  signInAnonymouslyIfNeeded: vi.fn().mockResolvedValue({ isAnonymous: true }),
  useAuth: () => ({
    username: "Guest",
    currentUser: { value: null },
    isAnonymousUser: false,
    isAuthenticatedUser: false,
    isCurrentUserLoaded: true,
    signInAnonymously: vi.fn().mockResolvedValue({ isAnonymous: true }),
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("@/components/pages/Game/TurnStatusStrip.vue", () => ({
  default: {
    name: "TurnStatusStrip",
    props: ["status", "currentTurn"],
    template:
      '<div data-testid="turn-status-strip" :data-status="status" :data-current-turn="String(currentTurn)" />',
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
    props: ["isFinished"],
    template:
      '<div data-testid="game-map" :data-is-finished="String(isFinished)" />',
  },
}));

vi.mock("@/components/pages/Game/AvailableMovesCard.vue", () => ({
  default: {
    name: "AvailableMovesCard",
    props: ["availableMoves", "isAiTurn", "isSelecting", "isSelectDisabled"],
    template:
      '<div data-testid="available-moves-card" :data-moves="String(availableMoves.length)" :data-is-ai-turn="String(isAiTurn)" :data-is-selecting="String(isSelecting)" :data-is-select-disabled="String(isSelectDisabled)" />',
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

vi.mock("@/components/pages/Game/PathResultCard.vue", () => ({
  default: {
    name: "PathResultCard",
    props: ["resultSteps"],
    template:
      '<div data-testid="path-result-card" :data-steps="String(resultSteps.length)" />',
  },
}));

vi.mock("@/components/pages/Game/PlayerMatchupCard.vue", () => ({
  default: {
    name: "PlayerMatchupCard",
    props: ["playerName"],
    template:
      '<div data-testid="player-matchup-card" :data-player-name="playerName" />',
  },
}));

import App from "@/App.vue";
import { createAppI18n } from "@/i18n";
import router from "@/router";

it("should render the default state properly", async () => {
  await router.push("/game/random-match");
  await router.isReady();

  const { container } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  expect(
    container.querySelector('[data-testid="turn-status-strip"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="countdown-timer"]'),
  ).not.toBeNull();
  expect(container.querySelectorAll('[data-testid="game-map"]')).toHaveLength(
    2,
  );
  expect(
    container
      .querySelectorAll('[data-testid="game-map"]')[0]
      ?.getAttribute("data-is-finished"),
  ).toBe("false");
  expect(
    container
      .querySelectorAll('[data-testid="game-map"]')[1]
      ?.getAttribute("data-is-finished"),
  ).toBe("true");
  expect(
    container.querySelector('[data-testid="available-moves-card"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="path-history-card"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="path-result-card"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="player-matchup-card"]'),
  ).not.toBeNull();
});
