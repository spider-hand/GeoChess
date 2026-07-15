import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";
import { createAppI18n } from "@/i18n";

const defaultProps = {
  availableMoves: ["us", "jp", "fr"],
  isVsAiGame: true,
  isPlayerTurn: true,
  isGameReady: true,
  isSelecting: false,
  isSelectDisabled: false,
};

const renderAvailableMovesCard = (
  props: Partial<
    typeof defaultProps & { onSelect: (countryCode: string) => void }
  > = {},
) =>
  render(AvailableMovesCard, {
    props: {
      ...defaultProps,
      ...props,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { getByAltText, getByRole } = renderAvailableMovesCard({
    isSelectDisabled: true,
  });

  await expect
    .element(getByRole("heading", { name: "Available Moves" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("listbox", { name: "Available Moves" }))
    .toBeInTheDocument();
  expect(getByRole("option")).toHaveLength(3);
  await expect.element(getByAltText("US flag")).toBeInTheDocument();
  await expect.element(getByRole("button", { name: "Select" })).toBeDisabled();
});

it("should enable the select button when a country is selected", async () => {
  const { getByRole } = renderAvailableMovesCard();

  const japanOption = getByRole("option", { name: "Japan JP" });

  await japanOption.click();

  await expect.element(japanOption).toHaveAttribute("aria-selected", "true");
  await expect.element(getByRole("button", { name: "Select" })).toBeEnabled();
});

it("should show the AI waiting state for vs AI games", async () => {
  const { container, getByLabelText } = renderAvailableMovesCard({
    isPlayerTurn: false,
    isSelectDisabled: true,
  });

  await expect.element(getByLabelText("AI is choosing..")).toBeVisible();
  expect(container.querySelectorAll('[role="option"]')).toHaveLength(0);
});

it("should show the opponent waiting state for non-AI games", async () => {
  const { getByLabelText } = renderAvailableMovesCard({
    isVsAiGame: false,
    isPlayerTurn: false,
    isGameReady: true,
    isSelectDisabled: true,
  });

  await expect.element(getByLabelText("Opponent is choosing..")).toBeVisible();
});

it("should not show the options and the button when the multiplayer game is not active", async () => {
  const { container } = renderAvailableMovesCard({
    isVsAiGame: false,
    isPlayerTurn: true,
    isGameReady: false,
    isSelectDisabled: true,
  });

  expect(container.querySelector('[role="listbox"]')).toBeNull();
  expect(container.querySelector(".available-moves-card__button")).toBeNull();
  expect(container.textContent).not.toContain("Opponent is choosing..");
  expect(container.textContent).not.toContain("AI is choosing..");
  expect(container.querySelectorAll('[role="option"]')).toHaveLength(0);
});

it("should update the button label when selecting a move", async () => {
  const { getByRole } = renderAvailableMovesCard({
    isSelecting: true,
    isSelectDisabled: true,
  });

  await expect
    .element(getByRole("button", { name: "Selecting" }))
    .toBeDisabled();
});

it("should emit the selected country when the select button is pressed", async () => {
  const onSelect = vi.fn();
  const { getByRole } = renderAvailableMovesCard({ onSelect });

  await getByRole("option", { name: "France FR" }).click();
  await getByRole("button", { name: "Select" }).click();

  expect(onSelect).toHaveBeenCalledWith("fr");
  expect(onSelect).toHaveBeenCalledTimes(1);
});

it("should show country + code on the option when the localized name is available", async () => {
  const { getByRole } = renderAvailableMovesCard();

  await expect
    .element(getByRole("option", { name: "United States US" }))
    .toBeVisible();
});

it("should show the country code only when the localized name is missing", async () => {
  const { getByRole } = renderAvailableMovesCard({
    availableMoves: ["zz"],
    isSelectDisabled: true,
  });

  await expect.element(getByRole("option", { name: "ZZ" })).toBeVisible();
});
