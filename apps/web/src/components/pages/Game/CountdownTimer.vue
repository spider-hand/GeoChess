<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

type TimerMode = "countdown" | "elapsed";

defineOptions({
  name: "GameCountdownTimer",
});

const props = withDefaults(
  defineProps<{
    bufferMs?: number;
    durationMs?: number;
    mode: TimerMode;
    startedAtMs: number;
  }>(),
  {
    bufferMs: 0,
    durationMs: 60_000,
  },
);

const emit = defineEmits<{
  timeUp: [];
}>();

const DANGER_THRESHOLD_MS = 10_000;
const TICK_INTERVAL_MS = 100;

const nowMs = ref(Date.now());
const timeoutId = ref<number | null>(null);
const emittedDeadlineKey = ref<string | null>(null);

const countdownTargetMs = computed(
  () => props.startedAtMs + props.durationMs + props.bufferMs,
);
const remainingMs = computed(() =>
  Math.max(0, countdownTargetMs.value - nowMs.value),
);
const elapsedMs = computed(() => Math.max(0, nowMs.value - props.startedAtMs));

const displayMs = computed(() =>
  props.mode === "countdown" ? remainingMs.value : elapsedMs.value,
);
const displaySeconds = computed(() => Math.floor(displayMs.value / 1_000));

const formattedTime = computed(() => {
  const minutes = Math.floor(displaySeconds.value / 60);
  const seconds = displaySeconds.value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

const isDanger = computed(
  () =>
    props.mode === "countdown" &&
    remainingMs.value > 0 &&
    remainingMs.value < DANGER_THRESHOLD_MS,
);

function clearTick() {
  if (timeoutId.value !== null) {
    window.clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }
}

function tick() {
  nowMs.value = Date.now();
  timeoutId.value = window.setTimeout(tick, TICK_INTERVAL_MS);
}

// Reset the deadline key whenever the countdown target changes, so that we can emit `timeUp` again if the countdown restarts.
watch(
  () => `${props.mode}:${countdownTargetMs.value}`,
  () => {
    emittedDeadlineKey.value = null;
  },
  { immediate: true },
);

// Emit `timeUp` when the countdown reaches zero, but only once per countdown target.
watch(
  () => [props.mode, remainingMs.value, countdownTargetMs.value] as const,
  ([mode, nextRemainingMs, targetMs]) => {
    if (mode !== "countdown" || nextRemainingMs > 0) {
      return;
    }

    const deadlineKey = `${targetMs}`;
    if (emittedDeadlineKey.value === deadlineKey) {
      return;
    }

    emittedDeadlineKey.value = deadlineKey;
    emit("timeUp");
  },
  { immediate: true },
);

onMounted(() => {
  tick();
});

onBeforeUnmount(() => {
  clearTick();
});
</script>

<template>
  <section class="countdown-timer" role="timer">
    <span
      class="countdown-timer__value"
      :class="{
        'countdown-timer__value--danger': isDanger,
      }"
    >
      {{ formattedTime }}
    </span>
  </section>
</template>

<style scoped>
.countdown-timer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  min-height: 44px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background-color: transparent;
}

.countdown-timer__value {
  color: var(--on-dark);
  font-family: var(--font-number);
  font-size: var(--font-size-number-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-copy);
  letter-spacing: var(--letter-spacing-default);
  font-variant-numeric: tabular-nums;
}

.countdown-timer__value--danger {
  color: var(--danger);
}
</style>
