import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";

import UserAvatarMenu from "@/components/shared/UserAvatarMenu.vue";

const meta = {
  title: "Components/Shared/UserAvatarMenu",
  component: UserAvatarMenu,
  tags: ["autodocs"],
  args: {
    displayName: "Taylor Swift",
  },
} satisfies Meta<typeof UserAvatarMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Account menu" }));

    await expect(canvas.getByRole("menu")).toBeInTheDocument();
    await expect(canvas.getByText("Taylor Swift")).toBeInTheDocument();
    await expect(
      canvas.getByRole("menuitem", { name: "Sign Out" }),
    ).toBeInTheDocument();
  },
};
