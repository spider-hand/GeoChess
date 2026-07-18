import type { Meta, StoryObj } from "@storybook/vue3-vite";

import FriendsGamesSection from "@/components/pages/User/FriendsGamesSection.vue";

const meta = {
  title: "Components/Pages/User/FriendsGamesSection",
  component: FriendsGamesSection,
  tags: ["autodocs"],
} satisfies Meta<typeof FriendsGamesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
