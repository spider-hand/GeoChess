import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";
import { createAppI18n } from "@/i18n";
import type { AiPathStep, MultiplayerPathStep } from "@/types/game";

const defaultResultSteps: Array<AiPathStep> = [
  { countryCode: "bb", owner: "neutral" as const, turn: 0 },
  { countryCode: "jp", owner: "player" as const, turn: 1 },
  { countryCode: "fr", owner: "ai" as const, turn: 2 },
];

const renderPathResultCard = (resultSteps = defaultResultSteps) =>
  render(PathResultCard, {
    props: {
      resultSteps,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { container, getByRole, getByTestId, getByText } =
    renderPathResultCard();

  await expect
    .element(getByRole("heading", { name: "Path History" }))
    .toBeInTheDocument();
  await expect.element(getByText("You")).toBeVisible();
  await expect.element(getByText("AI")).toBeVisible();
  expect(getByRole("listitem")).toHaveLength(3);
  await expect.element(getByText("Start")).toBeVisible();
  await expect.element(getByText("Turn 1")).toBeVisible();
  await expect.element(getByText("Turn 2")).toBeVisible();
  await expect.element(getByText("Barbados")).toBeVisible();
  await expect.element(getByText("JP")).toBeVisible();
  await expect.element(getByText("France")).toBeVisible();
  expect(getByTestId("path-result-card-line")).toHaveLength(2);
  expect(
    container.querySelector(".path-result-card__step--neutral"),
  ).not.toBeNull();
  expect(
    container.querySelector(".path-result-card__step--player"),
  ).not.toBeNull();
  expect(container.querySelector(".path-result-card__step--ai")).not.toBeNull();
});

it("should fall back to the uppercased country code when the localized name is missing", async () => {
  const { getByText } = renderPathResultCard([
    { countryCode: "zz", owner: "neutral", turn: 0 },
  ]);

  await expect.element(getByText("ZZ")).toBeVisible();
});

it("should render Opponent for multiplayer step data", async () => {
  const multiplayerSteps: Array<MultiplayerPathStep> = [
    { countryCode: "bb", owner: "neutral", turn: 0 },
    { countryCode: "jp", owner: "player", turn: 1 },
    { countryCode: "fr", owner: "opponent", turn: 2 },
  ];
  const { container, getByText } = renderPathResultCard(multiplayerSteps);

  await expect.element(getByText("Opponent")).toBeVisible();
  expect(
    container.querySelector(".path-result-card__step--opponent"),
  ).not.toBeNull();
});
