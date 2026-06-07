import type { Meta, StoryObj } from "@storybook/vue3-vite";

import GameRandomMatchPage from "@/pages/GameRandomMatchPage.vue";

const meta = {
  title: "Pages/GameRandomMatchPage",
  component: GameRandomMatchPage,
  tags: ["autodocs"],
} satisfies Meta<typeof GameRandomMatchPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
