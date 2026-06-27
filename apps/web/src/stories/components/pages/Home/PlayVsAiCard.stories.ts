import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";

import PlayVsAiCard from "@/components/pages/Home/PlayVsAiCard.vue";

const meta = {
  title: "Components/Pages/Home/PlayVsAiCard",
  component: PlayVsAiCard,
  tags: ["autodocs"],
} satisfies Meta<typeof PlayVsAiCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EasySelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Easy" }));

    await expect(canvas.getByRole("button", { name: "Easy" })).toHaveClass(
      "play-vs-ai-card__difficulty-button--selected",
    );
  },
};

export const HardSelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Hard" }));

    await expect(canvas.getByRole("button", { name: "Hard" })).toHaveClass(
      "play-vs-ai-card__difficulty-button--selected",
    );
  },
};

export const Loading: Story = {
  args: {
    isStartingGame: true,
  },
};
