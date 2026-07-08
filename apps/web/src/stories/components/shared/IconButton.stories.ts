import type { Meta, StoryObj } from "@storybook/vue3-vite";

import IconButton from "../../../components/shared/IconButton.vue";

const meta = {
  title: "Components/Shared/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["md", "compact"],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    ariaLabel: "Language settings",
    size: "md",
    disabled: false,
  },
  render: (args) => ({
    components: { IconButton },
    setup: () => ({ args }),
    template: `
      <IconButton v-bind="args">
        <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M3 12h18M12 3c2.6 2.5 4 5.7 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.7-4-9s1.4-6.5 4-9Z"
            stroke="currentColor"
            stroke-width="1.5"
          />
        </svg>
      </IconButton>
    `,
  }),
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    size: "compact",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
