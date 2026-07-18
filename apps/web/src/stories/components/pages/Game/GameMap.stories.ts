import type { Meta, StoryObj } from "@storybook/vue3-vite";

import GameMap from "@/components/pages/Game/GameMap.vue";
import type { AiGameMapMarker, MultiplayerGameMapMarker } from "@/types/game";

const finishedMarkers: Array<AiGameMapMarker> = [
  { countryCode: "JP", owner: "neutral", label: "Start" },
  { countryCode: "KR", owner: "player", label: "Taylor Swift" },
  { countryCode: "CN", owner: "ai", label: "AI" },
];

const multiplayerFinishedMarkers: Array<MultiplayerGameMapMarker> = [
  { countryCode: "JP", owner: "neutral", label: "Start" },
  { countryCode: "KR", owner: "player", label: "Taylor Swift" },
  { countryCode: "CN", owner: "opponent", label: "Opponent" },
];

const meta = {
  title: "Components/Pages/Game/GameMap",
  component: GameMap,
  tags: ["autodocs"],
  args: {
    isFinished: false,
    markers: [],
  },
  render: (args) => ({
    components: { GameMap },
    template: `
      <div style="width: min(100%, 720px);">
        <GameMap v-bind="args" style="width: 100%;" />
      </div>
    `,
    setup: () => ({ args }),
  }),
} satisfies Meta<typeof GameMap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FinishedState: Story = {
  args: {
    isFinished: true,
    markers: finishedMarkers,
  },
};

export const MultiplayerFinishedState: Story = {
  args: {
    isFinished: true,
    markers: multiplayerFinishedMarkers,
  },
};
