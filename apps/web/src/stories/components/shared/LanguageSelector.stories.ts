import type { Meta, StoryObj } from "@storybook/vue3-vite";

import LanguageSelector from "../../../components/shared/LanguageSelector.vue";

const meta = {
  title: "Components/Shared/LanguageSelector",
  component: LanguageSelector,
  tags: ["autodocs"],
  args: {
    initialLanguage: "en",
  },
} satisfies Meta<typeof LanguageSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectedJapanese: Story = {
  args: {
    initialLanguage: "ja",
  },
};
