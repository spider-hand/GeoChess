import { nextTick } from "vue";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import CountdownTimer from "@/components/pages/Game/CountdownTimer.vue";

let nowMs = 0;

const advanceBy = async (ms: number) => {
  await vi.advanceTimersByTimeAsync(ms);
  await nextTick();
};

beforeEach(() => {
  nowMs = 1_751_155_200_000;
  vi.useFakeTimers();
  vi.setSystemTime(nowMs);
});

afterEach(() => {
  vi.useRealTimers();
});

test("renders the countdown timer and starts at 01:00", async () => {
  const { getByRole, getByText } = render(CountdownTimer, {
    props: {
      startedAtMs: nowMs,
    },
  });

  await expect.element(getByRole("timer")).toBeVisible();
  await expect.element(getByText("01:00")).toBeVisible();
});

test("switches to the danger color when the remaining time drops below ten seconds", async () => {
  const { container, getByText } = render(CountdownTimer, {
    props: {
      startedAtMs: nowMs,
    },
  });

  await advanceBy(51_000);

  await expect.element(getByText("00:09")).toBeVisible();
  await expect
    .element(container.querySelector(".countdown-timer__value") as HTMLElement)
    .toHaveClass("countdown-timer__value--danger");
});

test("emits time-up once when the countdown reaches zero", async () => {
  const onTimeUp = vi.fn();
  const { getByText } = render(CountdownTimer, {
    props: {
      startedAtMs: nowMs,
      onTimeUp,
    },
  });

  await advanceBy(60_500);

  await expect.element(getByText("00:00")).toBeVisible();
  expect(onTimeUp).toHaveBeenCalledTimes(1);

  await advanceBy(5_000);

  expect(onTimeUp).toHaveBeenCalledTimes(1);
});
