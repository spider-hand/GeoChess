import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";

const meta = {
  title: "Components/Pages/Game/PathResultCard",
  component: PathResultCard,
  tags: ["autodocs"],
} satisfies Meta<typeof PathResultCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
