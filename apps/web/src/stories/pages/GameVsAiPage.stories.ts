import type { Meta, StoryObj } from "@storybook/vue3-vite";

import GameVsAiPage from "@/pages/GameVsAiPage.vue";

const meta = {
  title: "Pages/GameVsAiPage",
  component: GameVsAiPage,
  tags: ["autodocs"],
} satisfies Meta<typeof GameVsAiPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
