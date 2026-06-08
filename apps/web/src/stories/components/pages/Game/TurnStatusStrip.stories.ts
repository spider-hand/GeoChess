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

export const YourTurn: Story = {
  args: {
    isYourTurn: true,
  },
};

export const OpponentTurn: Story = {
  args: {
    isYourTurn: false,
    currentTurn: 11,
  },
};
