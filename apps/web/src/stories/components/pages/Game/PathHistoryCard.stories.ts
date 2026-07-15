import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";
import type { AiPathStep, MultiplayerPathStep } from "@/types/game";

const aiHistorySteps: Array<AiPathStep> = [
  { countryCode: "bb", owner: "neutral", turn: 0 },
  { countryCode: "cc", owner: "player", turn: 1 },
  { countryCode: "dd", owner: "ai", turn: 2 },
  { countryCode: "ee", owner: "player", turn: 3 },
];

const multiplayerHistorySteps: Array<MultiplayerPathStep> = [
  { countryCode: "bb", owner: "neutral", turn: 0 },
  { countryCode: "cc", owner: "player", turn: 1 },
  { countryCode: "dd", owner: "opponent", turn: 2 },
  { countryCode: "ee", owner: "player", turn: 3 },
];

const meta = {
  title: "Components/Pages/Game/PathHistoryCard",
  component: PathHistoryCard,
  tags: ["autodocs"],
  args: {
    historySteps: aiHistorySteps,
    isGameReady: true,
  },
} satisfies Meta<typeof PathHistoryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Multiplayer: Story = {
  args: {
    historySteps: multiplayerHistorySteps,
  },
};

export const NotReady: Story = {
  args: {
    historySteps: multiplayerHistorySteps,
    isGameReady: false,
  },
};
