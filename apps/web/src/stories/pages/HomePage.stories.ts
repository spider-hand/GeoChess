import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";

import HomePage from "@/pages/HomePage.vue";

const meta = {
  title: "Pages/HomePage",
  component: HomePage,
  tags: ["autodocs"],
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DifficultySelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Hard" }));

    await expect(canvas.getByRole("button", { name: "Hard" })).toHaveClass(
      "play-vs-ai-card__difficulty-button--selected",
    );
  },
};

export const SignUpPromptOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Create Room" }));

    await expect(
      canvas.getByRole("dialog", { name: "Welcome to GeoChess" }),
    ).toBeVisible();
  },
};
