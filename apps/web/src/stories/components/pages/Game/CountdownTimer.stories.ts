import type { Meta, StoryObj } from "@storybook/vue3-vite";

import CountdownTimer from "@/components/pages/Game/CountdownTimer.vue";

const meta = {
  title: "Components/Pages/Game/CountdownTimer",
  component: CountdownTimer,
  tags: ["autodocs"],
} satisfies Meta<typeof CountdownTimer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
