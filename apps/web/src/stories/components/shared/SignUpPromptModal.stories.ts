import type { Meta, StoryObj } from "@storybook/vue3-vite";

import SignUpPromptModal from "@/components/shared/SignUpPromptModal.vue";

const meta = {
  title: "Components/Shared/SignUpPromptModal",
  component: SignUpPromptModal,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    isSigningUp: false,
  },
  render: (args) => ({
    components: { SignUpPromptModal },
    setup: () => ({ args }),
    template:
      '<div style="min-height: 100vh; background: #0d1117;"><SignUpPromptModal v-bind="args" /></div>',
  }),
} satisfies Meta<typeof SignUpPromptModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SigningUp: Story = {
  args: {
    isSigningUp: true,
  },
};
