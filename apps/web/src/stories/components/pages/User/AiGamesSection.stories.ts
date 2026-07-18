import type { Meta, StoryObj } from "@storybook/vue3-vite";

import AiGamesSection from "@/components/pages/User/AiGamesSection.vue";

const meta = {
  title: "Components/Pages/User/AiGamesSection",
  component: AiGamesSection,
  tags: ["autodocs"],
} satisfies Meta<typeof AiGamesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
