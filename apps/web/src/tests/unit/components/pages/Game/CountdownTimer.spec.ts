import { nextTick } from "vue";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import CountdownTimer from "@/components/pages/Game/CountdownTimer.vue";

let nowMs = 0;

const advanceBy = async (ms: number) => {
  await vi.advanceTimersByTimeAsync(ms);
  await nextTick();
};

const renderCountdownTimer = (
  props: Partial<{ startedAtMs: number } & { onTimeUp: () => void }> = {},
) =>
  render(CountdownTimer, {
    props: {
      startedAtMs: nowMs,
      ...props,
    },
  });

beforeEach(() => {
  nowMs = 1_751_155_200_000;
  vi.useFakeTimers();
  vi.setSystemTime(nowMs);
});

afterEach(() => {
  vi.useRealTimers();
});

it("should render the default state properly", async () => {
  const { getByRole, getByText } = renderCountdownTimer();

  await expect.element(getByRole("timer")).toBeVisible();
  await expect.element(getByText("01:00")).toBeVisible();
});

it("should apply the danger class when the remaining time is below 10 seconds", async () => {
  const { container, getByText } = renderCountdownTimer();

  await advanceBy(51_000);

  await expect.element(getByText("00:09")).toBeVisible();
  await expect
    .element(container.querySelector(".countdown-timer__value") as HTMLElement)
    .toHaveClass("countdown-timer__value--danger");
});

it("should emit time-up event when the countdown reaches zero", async () => {
  const onTimeUp = vi.fn();
  const { getByText } = renderCountdownTimer({ onTimeUp });

  await advanceBy(60_500);

  await expect.element(getByText("00:00")).toBeVisible();
  expect(onTimeUp).toHaveBeenCalledTimes(1);
});

it("should not emit time-up event multiple times when the countdown reaches zero", async () => {
  const onTimeUp = vi.fn();

  renderCountdownTimer({ onTimeUp });

  await advanceBy(60_500);
  await advanceBy(5_000);

  expect(onTimeUp).toHaveBeenCalledTimes(1);
});
