import { defineComponent, nextTick, ref } from "vue";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import CountdownTimer from "@/components/pages/Game/CountdownTimer.vue";

type CountdownTimerExposed = {
  pause: () => void;
  start: () => void;
};

const CountdownTimerHarness = defineComponent({
  components: {
    CountdownTimer,
  },
  setup() {
    const timer = ref<CountdownTimerExposed | null>(null);
    const timeUpCount = ref(0);

    function start() {
      timer.value?.start();
    }

    function pause() {
      timer.value?.pause();
    }

    return {
      pause,
      start,
      timer,
      timeUpCount,
    };
  },
  template: `
    <div>
      <CountdownTimer ref="timer" @time-up="timeUpCount += 1" />
      <button type="button" @click="pause">Pause</button>
      <button type="button" @click="start">Start</button>
      <output data-testid="time-up-count">{{ timeUpCount }}</output>
    </div>
  `,
});

let nowMs = 0;

async function advanceBy(ms: number) {
  nowMs += ms;
  await vi.advanceTimersByTimeAsync(ms);
  await nextTick();
}

beforeEach(() => {
  nowMs = 0;
  vi.useFakeTimers();
  vi.spyOn(performance, "now").mockImplementation(() => nowMs);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test("renders the countdown timer and starts at 01:00", async () => {
  const { getByRole, getByText } = render(CountdownTimer);

  await expect.element(getByRole("timer")).toBeVisible();
  await expect.element(getByText("01:00")).toBeVisible();
});

test("switches to the danger color when the remaining time drops below ten seconds", async () => {
  const { container, getByText } = render(CountdownTimer);

  await advanceBy(51_000);

  await expect.element(getByText("00:09")).toBeVisible();
  await expect
    .element(container.querySelector(".countdown-timer__value") as HTMLElement)
    .toHaveClass("countdown-timer__value--danger");
});

test("pauses and resumes the countdown from the precise remaining time", async () => {
  const { getByRole, getByTestId, getByText } = render(CountdownTimerHarness);

  await advanceBy(10_500);

  await expect.element(getByText("00:50")).toBeVisible();
  await getByRole("button", { name: "Pause" }).click();
  await advanceBy(10_000);
  await expect.element(getByText("00:50")).toBeVisible();
  await expect.element(getByTestId("time-up-count")).toHaveTextContent("0");

  await getByRole("button", { name: "Start" }).click();
  await advanceBy(600);

  await expect.element(getByText("00:49")).toBeVisible();
});

test("emits time-up once at expiry and does not restart after reaching zero", async () => {
  const { getByRole, getByTestId, getByText } = render(CountdownTimerHarness);

  await advanceBy(60_000);

  await expect.element(getByText("00:00")).toBeVisible();
  await expect.element(getByTestId("time-up-count")).toHaveTextContent("1");

  await getByRole("button", { name: "Start" }).click();
  await advanceBy(5_000);

  await expect.element(getByText("00:00")).toBeVisible();
  await expect.element(getByTestId("time-up-count")).toHaveTextContent("1");
});
