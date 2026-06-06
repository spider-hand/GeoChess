import type { Meta, StoryObj } from "@storybook/vue3-vite";

import NavigationHeader from "../../../components/shared/NavigationHeader.vue";

const meta = {
  title: "Components/Shared/NavigationHeader",
  component: NavigationHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
