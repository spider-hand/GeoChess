import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";
import { createAppI18n } from "@/i18n";

const defaultHistorySteps = [
  { countryCode: "bb", owner: "neutral" as const, turn: 0 },
  { countryCode: "cc", owner: "player" as const, turn: 1 },
  { countryCode: "dd", owner: "ai" as const, turn: 2 },
];

const renderPathHistoryCard = (historySteps = defaultHistorySteps) =>
  render(PathHistoryCard, {
    props: {
      historySteps,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { container, getByAltText, getByText, getByRole, getByTestId } =
    renderPathHistoryCard();

  await expect
    .element(getByRole("heading", { name: "Path History" }))
    .toBeInTheDocument();
  await expect.element(getByText("You")).toBeVisible();
  await expect.element(getByText("AI")).toBeVisible();
  await expect.element(getByText("Start")).toBeVisible();
  await expect.element(getByText("Turn 1")).toBeVisible();
  await expect.element(getByText("Turn 2")).toBeVisible();
  await expect.element(getByText("BB")).toBeVisible();
  await expect.element(getByText("CC")).toBeVisible();
  await expect.element(getByText("DD")).toBeVisible();
  await expect.element(getByAltText("cc flag")).toBeVisible();
  expect(getByRole("listitem")).toHaveLength(3);
  expect(getByTestId("path-history-card-connector")).toHaveLength(2);
  expect(
    container.querySelector(".path-history-card__step--neutral"),
  ).not.toBeNull();
  expect(
    container.querySelector(".path-history-card__step--player"),
  ).not.toBeNull();
  expect(
    container.querySelector(".path-history-card__step--ai"),
  ).not.toBeNull();
});

it("should not render the connector for the last item in the history", async () => {
  const { getByRole, getByTestId } = renderPathHistoryCard([
    { countryCode: "bb", owner: "neutral", turn: 0 },
  ]);

  expect(getByRole("listitem")).toHaveLength(1);
  expect(getByTestId("path-history-card-connector")).toHaveLength(0);
});
