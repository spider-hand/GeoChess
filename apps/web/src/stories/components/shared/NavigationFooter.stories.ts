import type { Meta, StoryObj } from "@storybook/vue3-vite";

import NavigationFooter from "@/components/shared/NavigationFooter.vue";

const meta = {
  title: "Components/Shared/NavigationFooter",
  component: NavigationFooter,
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
