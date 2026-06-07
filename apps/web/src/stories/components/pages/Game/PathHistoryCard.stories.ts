import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";

const meta = {
  title: "Components/Pages/Game/PathHistoryCard",
  component: PathHistoryCard,
  tags: ["autodocs"],
} satisfies Meta<typeof PathHistoryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CurrentTurnSix: Story = {};

export const CurrentTurnFive: Story = {
  args: {
    currentTurn: 5,
    historySteps: [
      {
        countryCode: "us",
        owner: "you",
        turn: 1,
      },
      {
        countryCode: "jp",
        owner: "opponent",
        turn: 2,
      },
      {
        countryCode: "fr",
        owner: "you",
        turn: 3,
      },
      {
        countryCode: "br",
        owner: "opponent",
        turn: 4,
      },
    ],
  },
};
