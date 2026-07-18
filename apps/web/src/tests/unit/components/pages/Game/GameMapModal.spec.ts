import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import GameMapModal from "@/components/pages/Game/GameMapModal.vue";
import { createAppI18n } from "@/i18n";

vi.mock("@/components/pages/Game/GameMap.vue", () => ({
  default: {
    name: "GameMap",
    props: ["isFinished", "isFullscreen", "markers"],
    template: '<div data-testid="game-map" />',
  },
}));

const renderGameMapModal = (props: Record<string, unknown> = {}) =>
  render(GameMapModal, {
    props: {
      isFinished: false,
      isOpen: true,
      markers: [],
      ...props,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { getByRole, getByTestId } = renderGameMapModal();

  await expect.element(getByRole("button", { name: "Show map" })).toBeVisible();
  await expect.element(getByRole("dialog", { name: "Show map" })).toBeVisible();
  await expect.element(getByTestId("game-map")).toBeVisible();
});

it("should open and close the map modal", async () => {
  const onClose = vi.fn();
  const onOpen = vi.fn();
  const { container, getByRole } = renderGameMapModal({
    isOpen: false,
    onClose,
    onOpen,
  });

  expect(container.querySelector('[role="dialog"]')).toBeNull();

  await getByRole("button", { name: "Show map" }).click();
  expect(onOpen).toHaveBeenCalledTimes(1);
});

it("should emit close when the close button is clicked", async () => {
  const onClose = vi.fn();
  const { getByRole } = renderGameMapModal({ onClose });

  await getByRole("button", { name: "Close map" }).click();

  expect(onClose).toHaveBeenCalledTimes(1);
});
