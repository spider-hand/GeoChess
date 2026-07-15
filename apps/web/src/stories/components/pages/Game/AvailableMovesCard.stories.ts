import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";

import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";

const meta = {
  title: "Components/Pages/Game/AvailableMovesCard",
  component: AvailableMovesCard,
  tags: ["autodocs"],
  args: {
    availableMoves: ["us", "jp", "fr"],
    isVsAiGame: true,
    isPlayerTurn: true,
    isGameReady: true,
    isSelecting: false,
    isSelectDisabled: false,
  },
} satisfies Meta<typeof AvailableMovesCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CountrySelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("option", { name: "Japan JP" }));

    await expect(canvas.getByRole("button", { name: "Select" })).toBeEnabled();
  },
};

export const AiTurn: Story = {
  args: {
    isPlayerTurn: false,
    isSelectDisabled: true,
  },
};

export const OpponentTurn: Story = {
  args: {
    isVsAiGame: false,
    isPlayerTurn: false,
    isGameReady: true,
    isSelectDisabled: true,
  },
};

export const MultiplayerNotActive: Story = {
  args: {
    isVsAiGame: false,
    isPlayerTurn: true,
    isGameReady: false,
    isSelectDisabled: true,
  },
};

export const Selecting: Story = {
  args: {
    isSelecting: true,
    isSelectDisabled: true,
  },
};
