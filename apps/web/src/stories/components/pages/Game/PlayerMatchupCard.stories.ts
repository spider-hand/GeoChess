import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";

const meta = {
  title: "Components/Pages/Game/PlayerMatchupCard",
  component: PlayerMatchupCard,
  tags: ["autodocs"],
} satisfies Meta<typeof PlayerMatchupCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
