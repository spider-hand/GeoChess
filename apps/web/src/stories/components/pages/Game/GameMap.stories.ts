import type { Meta, StoryObj } from "@storybook/vue3-vite";

import GameMap from "@/components/pages/Game/GameMap.vue";

const meta = {
  title: "Components/Pages/Game/GameMap",
  component: GameMap,
  tags: ["autodocs"],
  render: () => ({
    components: { GameMap },
    template: `
      <div style="height: 360px; width: min(100%, 720px);">
        <GameMap style="height: 100%; width: 100%;" />
      </div>
    `,
  }),
} satisfies Meta<typeof GameMap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
