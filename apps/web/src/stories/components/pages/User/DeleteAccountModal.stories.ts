import type { Meta, StoryObj } from "@storybook/vue3-vite";

import DeleteAccountModal from "@/components/pages/User/DeleteAccountModal.vue";

const meta = {
  title: "Components/Pages/User/DeleteAccountModal",
  component: DeleteAccountModal,
  args: { errorMessage: null, isDeleting: false, isOpen: true },
  render: (args) => ({
    components: { DeleteAccountModal },
    setup: () => ({ args }),
    template:
      '<div style="min-height: 100vh; background: #181a20;"><DeleteAccountModal v-bind="args" /></div>',
  }),
} satisfies Meta<typeof DeleteAccountModal>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
