import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the title, legend badges, and condensed history for turn six", async () => {
  const { getByRole, getByText, container } = render(PathHistoryCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Path History" }))
    .toBeInTheDocument();
  await expect.element(getByText("You")).toBeVisible();
  await expect.element(getByText("Opponent")).toBeVisible();
  await expect.element(getByText(/^TURN 1$/)).toBeVisible();
  await expect.element(getByText(/^TURN 2$/)).toBeVisible();
  await expect.element(getByText(/^TURN 3$/)).toBeVisible();
  await expect.element(getByText(/^TURN 5$/)).toBeVisible();
  await expect.element(getByText(/^TURN 6$/)).toBeVisible();
  await expect.element(getByText("US")).toBeVisible();
  await expect.element(getByText("DE")).toBeVisible();
  expect(container.textContent).toContain("...");
  expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(5);
  expect(
    container.querySelectorAll(".path-history-card__connector"),
  ).toHaveLength(5);
});

test("shows continuous turns without ellipsis when current turn is five", async () => {
  const { container, getByText } = render(PathHistoryCard, {
    props: {
      currentTurn: 5,
      historySteps: [
        {
          countryCode: "us",
          owner: "you",
          turn: 1,
        },
        {
          countryCode: "jp",
          owner: "opponent",
          turn: 2,
        },
        {
          countryCode: "fr",
          owner: "you",
          turn: 3,
        },
        {
          countryCode: "br",
          owner: "opponent",
          turn: 4,
        },
      ],
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByText(/^TURN 1$/)).toBeVisible();
  await expect.element(getByText(/^TURN 2$/)).toBeVisible();
  await expect.element(getByText(/^TURN 3$/)).toBeVisible();
  await expect.element(getByText(/^TURN 4$/)).toBeVisible();
  await expect.element(getByText(/^TURN 5$/)).toBeVisible();
  await expect.element(getByText("US")).toBeVisible();
  await expect.element(getByText("JP")).toBeVisible();
  expect(container.textContent).not.toContain("...");
  expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(5);
});
