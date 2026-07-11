import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";
import { createAppI18n } from "@/i18n";

const defaultProps = {
  availableMoves: ["us", "jp", "fr"],
  isAiTurn: false,
  isSelecting: false,
  isSelectDisabled: false,
};

test("renders the title, available options, and disabled select button by default", async () => {
  const { getByAltText, getByRole } = render(AvailableMovesCard, {
    props: {
      ...defaultProps,
      isSelectDisabled: true,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Available Moves" }))
    .toBeInTheDocument();
  expect(getByRole("option").length).toBe(3);
  await expect.element(getByRole("button", { name: "Select" })).toBeDisabled();
  await expect
    .element(getByRole("listbox", { name: "Available Moves" }))
    .toBeInTheDocument();
  await expect.element(getByAltText("US flag")).toBeInTheDocument();
  await expect
    .element(getByRole("option", { name: "United States US" }))
    .toBeVisible();
});

test("selects a country row and enables the select button", async () => {
  const { getByRole } = render(AvailableMovesCard, {
    props: defaultProps,
    global: {
      plugins: [createAppI18n()],
    },
  });

  const japanOption = getByRole("option", { name: "Japan JP" });

  await japanOption.click();

  await expect.element(japanOption).toHaveAttribute("aria-selected", "true");
  await expect.element(getByRole("button", { name: "Select" })).toBeEnabled();
});

test("shows the AI waiting state while keeping the button visible", async () => {
  const { container, getByLabelText, getByRole } = render(AvailableMovesCard, {
    props: {
      ...defaultProps,
      isAiTurn: true,
      isSelectDisabled: true,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByLabelText("AI is choosing")).toBeVisible();
  expect(container.querySelectorAll('[role="option"]')).toHaveLength(0);
  await expect.element(getByRole("button", { name: "Select" })).toBeDisabled();
});

test("shows the selecting label while a move request is in flight", async () => {
  const { getByRole } = render(AvailableMovesCard, {
    props: {
      ...defaultProps,
      isSelecting: true,
      isSelectDisabled: true,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "Selecting" }))
    .toBeDisabled();
});

test("emits the selected country only when select is pressed", async () => {
  const onSelect = vi.fn();
  const { getByRole } = render(AvailableMovesCard, {
    props: {
      ...defaultProps,
      onSelect,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("option", { name: "France FR" }).click();

  expect(onSelect.mock.calls).toHaveLength(0);

  await getByRole("button", { name: "Select" }).click();

  expect(onSelect).toHaveBeenCalledWith("fr");
  expect(onSelect).toHaveBeenCalledTimes(1);
});

test("falls back to the uppercased country code when the localized name is missing", async () => {
  const { getByRole } = render(AvailableMovesCard, {
    props: {
      ...defaultProps,
      availableMoves: ["zz"],
      isSelectDisabled: true,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByRole("option", { name: "ZZ" })).toBeVisible();
});
