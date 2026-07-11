import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";

import PlayWithFriendsCard from "@/components/pages/Home/PlayWithFriendsCard.vue";

const meta = {
  title: "Components/Pages/Home/PlayWithFriendsCard",
  component: PlayWithFriendsCard,
  tags: ["autodocs"],
  args: {
    disabled: false,
  },
} satisfies Meta<typeof PlayWithFriendsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.getByPlaceholderText("6-Digit Key").click();
    await userEvent.tab();

    await expect(canvas.getByText("Enter a 6-digit key")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Enter Room" }),
    ).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
