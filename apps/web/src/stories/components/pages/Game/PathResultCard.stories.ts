import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";
import type { AiPathStep, MultiplayerPathStep } from "@/types/game";

const aiResultSteps: Array<AiPathStep> = [
  { countryCode: "us", owner: "neutral", turn: 0 },
  { countryCode: "jp", owner: "player", turn: 1 },
  { countryCode: "fr", owner: "ai", turn: 2 },
  { countryCode: "de", owner: "player", turn: 3 },
];

const multiplayerResultSteps: Array<MultiplayerPathStep> = [
  { countryCode: "us", owner: "neutral", turn: 0 },
  { countryCode: "jp", owner: "player", turn: 1 },
  { countryCode: "fr", owner: "opponent", turn: 2 },
  { countryCode: "de", owner: "player", turn: 3 },
];

const meta = {
  title: "Components/Pages/Game/PathResultCard",
  component: PathResultCard,
  tags: ["autodocs"],
  args: {
    resultSteps: aiResultSteps,
  },
} satisfies Meta<typeof PathResultCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Multiplayer: Story = {
  args: {
    resultSteps: multiplayerResultSteps,
  },
};
