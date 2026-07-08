import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";

const meta = {
  title: "Components/Pages/Game/PathResultCard",
  component: PathResultCard,
  tags: ["autodocs"],
  args: {
    resultSteps: [
      { countryCode: "bb", owner: "neutral", turn: 1 },
      { countryCode: "cc", owner: "player", turn: 2 },
      { countryCode: "dd", owner: "ai", turn: 3 },
      { countryCode: "ee", owner: "player", turn: 4 },
    ],
  },
} satisfies Meta<typeof PathResultCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
