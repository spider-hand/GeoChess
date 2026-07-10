import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";

const meta = {
  title: "Components/Pages/Game/PathHistoryCard",
  component: PathHistoryCard,
  tags: ["autodocs"],
  args: {
    historySteps: [
      { countryCode: "bb", owner: "neutral", turn: 0 },
      { countryCode: "cc", owner: "player", turn: 1 },
      { countryCode: "dd", owner: "ai", turn: 2 },
      { countryCode: "ee", owner: "player", turn: 3 },
    ],
  },
} satisfies Meta<typeof PathHistoryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
