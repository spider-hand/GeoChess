import type { Meta, StoryObj } from "@storybook/vue3-vite";

import TurnStatusStrip from "@/components/pages/Game/TurnStatusStrip.vue";

const meta = {
  title: "Components/Pages/Game/TurnStatusStrip",
  component: TurnStatusStrip,
  tags: ["autodocs"],
  args: {
    currentTurn: 10,
  },
} satisfies Meta<typeof TurnStatusStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PlayerTurn: Story = {
  args: {
    status: "player",
  },
};

export const AiTurn: Story = {
  args: {
    status: "ai",
    currentTurn: 11,
  },
};

export const Won: Story = {
  args: {
    status: "won",
    currentTurn: 12,
  },
};

export const Lost: Story = {
  args: {
    status: "lost",
    currentTurn: 12,
  },
};
