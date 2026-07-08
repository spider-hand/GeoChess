import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import Avatar from "@/components/shared/Avatar.vue";

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
