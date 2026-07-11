import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";

const meta = {
  title: "Components/Pages/Game/PathResultCard",
  component: PathResultCard,
  tags: ["autodocs"],
  args: {
    resultSteps: [
      { countryCode: "us", owner: "neutral", turn: 0 },
      { countryCode: "jp", owner: "player", turn: 1 },
      { countryCode: "fr", owner: "ai", turn: 2 },
      { countryCode: "de", owner: "player", turn: 3 },
    ],
  },
} satisfies Meta<typeof PathResultCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
