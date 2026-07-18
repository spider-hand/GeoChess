import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { userEvent, within } from "storybook/test";

import UserProfileSection from "@/components/pages/User/UserProfileSection.vue";

const meta = {
  title: "Components/Pages/User/UserProfileSection",
  component: UserProfileSection,
  tags: ["autodocs"],
} satisfies Meta<typeof UserProfileSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Edit Profile" }),
    );
  },
};

export const DeleteAccountDialog: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Delete Account" }),
    );
  },
};
