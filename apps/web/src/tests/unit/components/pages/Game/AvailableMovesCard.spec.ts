import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the title, six country options, and disabled select button", async () => {
  const { getByAltText, getByRole } = render(AvailableMovesCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Available Moves" }))
    .toBeInTheDocument();
  expect(getByRole("option").length).toBe(6);
  await expect.element(getByRole("button", { name: "Select" })).toBeDisabled();
  await expect
    .element(getByRole("listbox", { name: "Available Moves" }))
    .toBeInTheDocument();
  await expect.element(getByAltText("United States flag")).toBeInTheDocument();
});

test("selects a country row and enables the select button", async () => {
  const { getByRole } = render(AvailableMovesCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  const japanOption = getByRole("option", { name: /Japan flag Japan/i });

  await japanOption.click();

  await expect.element(japanOption).toHaveAttribute("aria-selected", "true");
  await expect.element(getByRole("button", { name: "Select" })).toBeEnabled();
});

test("emits the selected country only when select is pressed", async () => {
  const onSelect = vi.fn();
  const { getByRole } = render(AvailableMovesCard, {
    props: {
      onSelect,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("option", { name: /France flag France/i }).click();

  expect(onSelect.mock.calls).toHaveLength(0);

  await getByRole("button", { name: "Select" }).click();

  expect(onSelect).toHaveBeenCalledWith("fr");
  expect(onSelect).toHaveBeenCalledTimes(1);
});
