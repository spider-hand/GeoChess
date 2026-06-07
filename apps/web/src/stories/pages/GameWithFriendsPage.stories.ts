import type { Meta, StoryObj } from "@storybook/vue3-vite";

import GameWithFriendsPage from "@/pages/GameWithFriendsPage.vue";

const meta = {
  title: "Pages/GameWithFriendsPage",
  component: GameWithFriendsPage,
  tags: ["autodocs"],
} satisfies Meta<typeof GameWithFriendsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
