import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import RoomKeyStrip from "@/components/pages/Game/RoomKeyStrip.vue";
import { createAppI18n } from "@/i18n";

it("should render the room key", async () => {
  const { getByLabelText, getByText } = render(RoomKeyStrip, {
    props: {
      roomKey: "654321",
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByLabelText("Room Key, 654321")).toBeVisible();
  await expect.element(getByText("Room Key")).toBeVisible();
  await expect.element(getByText("654321")).toBeVisible();
});
