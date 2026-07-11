import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import Avatar from "@/components/shared/Avatar.vue";

const getAvatarStyle = (name: string) =>
  render(Avatar, {
    props: {
      name,
      size: "md",
    },
  })
    .container.querySelector(".avatar")
    ?.getAttribute("style");

test("renders initials from a multi-word name", async () => {
  const { getByText } = render(Avatar, {
    props: {
      name: "Taylor Swift",
      size: "md",
    },
  });

  await expect.element(getByText("TS")).toBeInTheDocument();
});

test("limits a single-word name to two characters", async () => {
  const { getByText } = render(Avatar, {
    props: {
      name: "Taylor",
      size: "md",
    },
  });

  await expect.element(getByText("TA")).toBeInTheDocument();
});

test("falls back to a question mark when the name is blank", async () => {
  const { getByText } = render(Avatar, {
    props: {
      name: "",
      size: "md",
    },
  });

  await expect.element(getByText("?")).toBeInTheDocument();
});

test("uses the same background for the same normalized name", () => {
  expect(getAvatarStyle("Taylor Swift")).toBe(
    getAvatarStyle("  taylor swift  "),
  );
});

test("uses different generated backgrounds for different names", () => {
  expect(getAvatarStyle("Taylor Swift")).not.toBe(
    getAvatarStyle("Olivia Rodrigo"),
  );
});

test("uses a generated hsl background for named avatars", () => {
  expect(getAvatarStyle("Taylor Swift")).toContain("background-color:");
  expect(getAvatarStyle("Taylor Swift")).not.toContain(
    "var(--surface-card-dark)",
  );
});

test("keeps the neutral fallback background for a blank name", () => {
  expect(getAvatarStyle("")).toContain("var(--surface-card-dark)");
});
