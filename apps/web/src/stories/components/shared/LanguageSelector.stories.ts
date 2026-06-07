import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { appI18n } from "../../../i18n";
import LanguageSelector from "../../../components/shared/LanguageSelector.vue";

const meta = {
  title: "Components/Shared/LanguageSelector",
  component: LanguageSelector,
  tags: ["autodocs"],
} satisfies Meta<typeof LanguageSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    () => {
      appI18n.global.locale.value = "en";
      return {
        components: { LanguageSelector },
        template: "<LanguageSelector />",
      };
    },
  ],
};

export const SelectedJapanese: Story = {
  decorators: [
    () => {
      appI18n.global.locale.value = "ja";
      return {
        components: { LanguageSelector },
        template: "<LanguageSelector />",
      };
    },
  ],
};
