import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { ref } from "vue";

import { createAppI18n } from "@/i18n";
import type { GetAiGames200ResponseInner } from "@/services";

const mocks = vi.hoisted(() => ({
  data: undefined as GetAiGames200ResponseInner[] | undefined,
  isError: false,
  isLoading: false,
  isLoadingUser: false,
  user: {
    aiEasyWins: 6,
    aiEasyLosses: 1,
    aiMediumWins: 4,
    aiMediumLosses: 2,
    aiHardWins: 2,
    aiHardLosses: 1,
  },
}));

vi.mock("@/composables/useAiGameQuery", () => ({
  default: () => ({
    data: ref(mocks.data),
    isError: ref(mocks.isError),
    isLoading: ref(mocks.isLoading),
  }),
}));

vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({
    isLoadingUser: ref(mocks.isLoadingUser),
    user: ref(mocks.user),
  }),
}));

const AiGamesSection = (
  await import("@/components/pages/User/AiGamesSection.vue")
).default;

const response: GetAiGames200ResponseInner[] = [
  {
    id: "game-1",
    userId: "user-123",
    difficulty: "hard",
    result: "win",
    createdAt: new Date("2026-07-18T00:00:00.000Z"),
    updatedAt: new Date("2026-07-18T00:00:00.000Z"),
  },
];

const renderAiGamesSection = () =>
  render(AiGamesSection, {
    global: {
      plugins: [createAppI18n()],
    },
  });

beforeEach(() => {
  mocks.data = response;
  mocks.isError = false;
  mocks.isLoading = false;
  mocks.isLoadingUser = false;
});

it("should render the default state properly", async () => {
  const { container, getByRole } = renderAiGamesSection();
  const difficultyLabels = Array.from(
    container.querySelectorAll(".ai-games-section__record-label"),
    (label) => label.textContent?.trim(),
  );
  const recentGameCells = Array.from(
    container.querySelector(".ai-games-section__games li")?.children ?? [],
    (cell) => cell.textContent?.trim(),
  );

  expect(difficultyLabels).toEqual(["Easy", "Medium", "Hard"]);
  expect(
    container.querySelectorAll(".ai-games-section__record-card"),
  ).toHaveLength(3);
  await expect
    .element(
      container.querySelector(
        ".ai-games-section__difficulty-records",
      ) as HTMLElement,
    )
    .toBeVisible();
  await expect
    .element(container.querySelector(".data-table-card") as HTMLElement)
    .toBeVisible();
  expect(recentGameCells).toEqual(["HardWin", "Jul 18, 2026", "View game"]);
  await expect
    .element(getByRole("link", { name: "View game" }))
    .toHaveAttribute("href", "/game/vs-ai/game-1");
});

it.each([
  ["loading", "Loading AI games…"],
  ["error", "Unable to load AI games."],
])("should render the %s state visibly", async (state, message) => {
  mocks.data = undefined;
  mocks.isLoading = state === "loading";
  mocks.isError = state === "error";

  const { getByText } = renderAiGamesSection();

  await expect.element(getByText(message)).toBeVisible();
});

it("should show loading while the current user is loading", async () => {
  mocks.isLoadingUser = true;

  const { getByText } = renderAiGamesSection();

  await expect.element(getByText("Loading AI games…")).toBeVisible();
});

it("should show the empty history message", async () => {
  mocks.data = [];

  const { getByText } = renderAiGamesSection();

  await expect.element(getByText("No completed AI games yet.")).toBeVisible();
});
