import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";

import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";

const meta = {
  title: "Components/Pages/Game/AvailableMovesCard",
  component: AvailableMovesCard,
  tags: ["autodocs"],
} satisfies Meta<typeof AvailableMovesCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CountrySelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("option", { name: /Japan flag Japan/i }),
    );

    await expect(canvas.getByRole("button", { name: "Select" })).toBeEnabled();
  },
};
