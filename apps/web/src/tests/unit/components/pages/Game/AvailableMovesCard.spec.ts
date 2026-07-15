import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";
import { createAppI18n } from "@/i18n";

const defaultProps = {
  availableMoves: ["us", "jp", "fr"],
  isAiTurn: false,
  isSelecting: false,
  isSelectDisabled: false,
  roomStatus: undefined,
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

it("should show the AI waiting state when it's the AI's turn", async () => {
  const { container, getByLabelText } = renderAvailableMovesCard({
    isAiTurn: true,
    isSelectDisabled: true,
  });

  await expect.element(getByLabelText("AI is choosing")).toBeVisible();
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
