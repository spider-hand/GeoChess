import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { userEvent, within } from "storybook/test";

import NavigationHeader from "../../../components/shared/NavigationHeader.vue";

const meta = {
  title: "Components/Shared/NavigationHeader",
  component: NavigationHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MobileMenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Open navigation menu" }),
    );
  },
};
