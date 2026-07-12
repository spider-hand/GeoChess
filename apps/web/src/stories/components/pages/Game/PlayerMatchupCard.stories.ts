import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";

const meta = {
  title: "Components/Pages/Game/PlayerMatchupCard",
  component: PlayerMatchupCard,
  tags: ["autodocs"],
  args: {
    playerName: "Taylor Swift",
  },
} satisfies Meta<typeof PlayerMatchupCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCountry: Story = {
  args: {
    playerCountry: "JP",
  },
};
