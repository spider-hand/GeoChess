<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

defineOptions({
  name: "GameCountdownTimer",
});

const emit = defineEmits<{
  timeUp: [];
}>();

const INITIAL_REMAINING_MS = 60_000;
const DANGER_THRESHOLD_MS = 10_000;
const TICK_INTERVAL_MS = 100;

const remainingMs = ref(INITIAL_REMAINING_MS);
const isRunning = ref(false);
const hasExpired = ref(false);
const remainingAtStartMs = ref(INITIAL_REMAINING_MS);
const startedAtMs = ref(0);
const timeoutId = ref<number | null>(null);

const displaySeconds = computed(() =>
  remainingMs.value <= 0 ? 0 : Math.ceil(remainingMs.value / 1_000),
);

const formattedTime = computed(() => {
  const minutes = Math.floor(displaySeconds.value / 60);
  const seconds = displaySeconds.value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

const isDanger = computed(
  () => remainingMs.value > 0 && remainingMs.value < DANGER_THRESHOLD_MS,
);

function clearScheduledTick() {
  if (timeoutId.value !== null) {
    window.clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }
}

function syncRemainingTime() {
  const elapsedMs = performance.now() - startedAtMs.value;
  const nextRemainingMs = Math.max(0, remainingAtStartMs.value - elapsedMs);
  remainingMs.value = nextRemainingMs;

  return nextRemainingMs;
}

function handleTimeUp() {
  if (hasExpired.value) {
    return;
  }

  hasExpired.value = true;
  isRunning.value = false;
  remainingMs.value = 0;
  clearScheduledTick();
  emit("timeUp");
}

function tick() {
  if (!isRunning.value) {
    return;
  }

  if (syncRemainingTime() <= 0) {
    handleTimeUp();
    return;
  }

  timeoutId.value = window.setTimeout(tick, TICK_INTERVAL_MS);
}

function start() {
  if (isRunning.value || hasExpired.value) {
    return;
  }

  remainingAtStartMs.value = remainingMs.value;
  startedAtMs.value = performance.now();
  isRunning.value = true;
  timeoutId.value = window.setTimeout(tick, TICK_INTERVAL_MS);
}

function pause() {
  if (!isRunning.value || hasExpired.value) {
    return;
  }

  syncRemainingTime();
  isRunning.value = false;
  clearScheduledTick();
}

defineExpose({
  start,
  pause,
});

onMounted(() => {
  start();
});

onBeforeUnmount(() => {
  clearScheduledTick();
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
