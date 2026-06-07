import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import PlayWithFriendsCard from "@/components/pages/Home/PlayWithFriendsCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the card actions and join controls", async () => {
  const { getByRole, getByText } = render(PlayWithFriendsCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Play with Friends" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Create Room" }))
    .toBeVisible();
  await expect.element(getByText("or")).toBeVisible();
  await expect.element(getByRole("textbox")).toBeVisible();
  await expect
    .element(getByRole("textbox"))
    .toHaveAttribute("placeholder", "6-Digit Key");
  await expect
    .element(getByRole("button", { name: "Enter Room" }))
    .toBeDisabled();
});

test("normalizes the room key and shows validation after interaction", async () => {
  const { getByRole, getByText } = render(PlayWithFriendsCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  const input = getByRole("textbox");
  const inputElement = document
    .querySelectorAll("input")
    .item(document.querySelectorAll("input").length - 1);

  if (!(inputElement instanceof HTMLInputElement)) {
    throw new Error("Expected room key input to be rendered");
  }

  inputElement.value = "12ab34567";
  inputElement.dispatchEvent(new Event("input", { bubbles: true }));

  await expect.element(input).toHaveValue("123456");
  await expect
    .element(getByRole("button", { name: "Enter Room" }))
    .toBeEnabled();

  inputElement.value = "12";
  inputElement.dispatchEvent(new Event("input", { bubbles: true }));
  inputElement.dispatchEvent(new FocusEvent("blur", { bubbles: true }));

  await expect.element(getByText("Enter a 6-digit key")).toBeVisible();
  await expect
    .element(getByRole("button", { name: "Enter Room" }))
    .toBeDisabled();
});

test("emits the expected action events", async () => {
  const onCreateFriendsRoom = vi.fn();
  const onEnterFriendsRoom = vi.fn();
  const { getByRole } = render(PlayWithFriendsCard, {
    props: {
      onCreateFriendsRoom,
      onEnterFriendsRoom,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Create Room" }).click();
  await getByRole("textbox").fill("654321");
  await getByRole("button", { name: "Enter Room" }).click();

  expect(onCreateFriendsRoom).toHaveBeenCalledTimes(1);
  expect(onEnterFriendsRoom).toHaveBeenCalledWith("654321");
});
