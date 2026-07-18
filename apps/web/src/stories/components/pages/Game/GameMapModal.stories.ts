import type { Meta, StoryObj } from "@storybook/vue3-vite";

import GameMapModal from "@/components/pages/Game/GameMapModal.vue";

const meta = {
  title: "Components/Pages/Game/GameMapModal",
  component: GameMapModal,
  tags: ["autodocs"],
  args: {
    isFinished: false,
    isOpen: true,
    markers: [],
  },
  render: (args) => ({
    components: { GameMapModal },
    setup: () => ({ args }),
    template:
      '<div style="min-height: 100vh; background: #0d1117;"><GameMapModal v-bind="args" /></div>',
  }),
} satisfies Meta<typeof GameMapModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
