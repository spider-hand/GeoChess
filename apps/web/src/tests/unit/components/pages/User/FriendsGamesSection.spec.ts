import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { ref } from "vue";

import { createAppI18n } from "@/i18n";
import type {
  GetWithFriendsGameStats200ResponseInner,
  GetWithFriendsGames200ResponseInner,
} from "@/services";

const mocks = vi.hoisted(() => ({
  games: undefined as GetWithFriendsGames200ResponseInner[] | undefined,
  stats: undefined as GetWithFriendsGameStats200ResponseInner[] | undefined,
  isGamesError: false,
  isGamesLoading: false,
  isStatsError: false,
  isStatsLoading: false,
}));

vi.mock("@/composables/useWithFriendsGameQuery", () => ({
  default: () => ({
    data: ref(mocks.games),
    isError: ref(mocks.isGamesError),
    isLoading: ref(mocks.isGamesLoading),
  }),
}));

vi.mock("@/composables/useWithFriendsGameStatsQuery", () => ({
  default: () => ({
    data: ref(mocks.stats),
    isError: ref(mocks.isStatsError),
    isLoading: ref(mocks.isStatsLoading),
  }),
}));

const FriendsGamesSection = (
  await import("@/components/pages/User/FriendsGamesSection.vue")
).default;

const renderFriendsGamesSection = () =>
  render(FriendsGamesSection, { global: { plugins: [createAppI18n()] } });

beforeEach(() => {
  mocks.games = [
    {
      id: "game-1",
      opponentDisplayName: "Deleted User",
      result: "win",
      expired: false,
      createdAt: new Date("2026-07-18T00:00:00.000Z"),
      updatedAt: new Date("2026-07-18T00:01:00.000Z"),
    },
    {
      id: "game-2",
      opponentDisplayName: "Ada Lovelace",
      result: "lose",
      expired: true,
      createdAt: new Date("2026-07-17T00:00:00.000Z"),
      updatedAt: new Date("2026-07-17T00:01:00.000Z"),
    },
  ];
  mocks.stats = [{ displayName: "Ada Lovelace", wins: 3, losses: 2 }];
  mocks.isGamesError = false;
  mocks.isGamesLoading = false;
  mocks.isStatsError = false;
  mocks.isStatsLoading = false;
});

it("should render the default state properly", async () => {
  const { container, getByRole, getByText } = renderFriendsGamesSection();

  await expect
    .element(
      container.querySelector(
        ".friends-games-section__record-card",
      ) as HTMLElement,
    )
    .toBeVisible();
  await expect.element(getByText("Deleted User")).toBeVisible();
  await expect
    .element(getByRole("link", { name: "View game" }))
    .toHaveAttribute("href", "/game/with-friends/game-1");
  await expect.element(getByText("Archived")).toBeVisible();
  expect(
    container.querySelectorAll(".friends-games-section__record-card"),
  ).toHaveLength(1);
});

it.each([
  ["loading", "Loading friends games…"],
  ["error", "Unable to load friends games."],
])("should render the %s state visibly", async (state, message) => {
  mocks.games = undefined;
  mocks.stats = undefined;
  mocks.isGamesLoading = state === "loading";
  mocks.isGamesError = state === "error";

  const { getByText } = renderFriendsGamesSection();

  await expect.element(getByText(message)).toBeVisible();
});

it("should show the empty history message", async () => {
  mocks.games = [];
  mocks.stats = [];

  const { getByText } = renderFriendsGamesSection();

  await expect
    .element(getByText("No completed friends games yet."))
    .toBeVisible();
});
