import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { appI18n } from "../../../i18n";
import HowToPlayButton from "../../../components/shared/HowToPlayButton.vue";

const meta = {
  title: "Components/Shared/HowToPlayButton",
  component: HowToPlayButton,
  tags: ["autodocs"],
} satisfies Meta<typeof HowToPlayButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    () => {
      appI18n.global.locale.value = "en";
      return {
        components: { HowToPlayButton },
        template: "<HowToPlayButton />",
      };
    },
  ],
};

export const Japanese: Story = {
  decorators: [
    () => {
      appI18n.global.locale.value = "ja";
      return {
        components: { HowToPlayButton },
        template: "<HowToPlayButton />",
      };
    },
  ],
};
