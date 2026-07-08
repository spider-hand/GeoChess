import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";

const meta = {
  title: "Components/Pages/Game/PathHistoryCard",
  component: PathHistoryCard,
  tags: ["autodocs"],
  args: {
    historySteps: [
      { countryCode: "bb", owner: "neutral", turn: 1 },
      { countryCode: "cc", owner: "player", turn: 2 },
      { countryCode: "dd", owner: "ai", turn: 3 },
      { countryCode: "ee", owner: "player", turn: 4 },
    ],
  },
} satisfies Meta<typeof PathHistoryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
