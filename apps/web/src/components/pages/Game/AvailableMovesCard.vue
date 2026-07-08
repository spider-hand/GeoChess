<script setup lang="ts">
import { Waypoints } from "@lucide/vue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { countryFlagSrc } from "@/utils/game";
import Button from "@/components/shared/Button.vue";

type AvailableMove = {
  code: string;
};

defineOptions({
  name: "GameAvailableMovesCard",
});

const props = defineProps<{
  availableMoves: Array<AvailableMove>;
  isAiTurn: boolean;
  isSelecting: boolean;
  isSelectDisabled: boolean;
}>();

const emit = defineEmits<{
  select: [countryCode: string];
}>();

const { t } = useI18n();
const selectedCountryCode = ref<string | null>(null);

const isWaiting = computed(() => props.isAiTurn);
const isButtonDisabled = computed(
  () => props.isSelectDisabled || selectedCountryCode.value === null,
);

watch(
  () => [props.availableMoves, props.isAiTurn],
  () => {
    selectedCountryCode.value = null;
  },
  { deep: true },
);

const selectCountry = (countryCode: string) => {
  if (props.isSelectDisabled) {
    return;
  }

  selectedCountryCode.value = countryCode;
};

const emitSelect = () => {
  if (selectedCountryCode.value === null || props.isSelectDisabled) {
    return;
  }

  emit("select", selectedCountryCode.value);
};
</script>

<template>
  <section class="available-moves-card">
    <div class="available-moves-card__title">
      <Waypoints class="available-moves-card__title-icon" :size="20" />
      <h2 class="available-moves-card__title-label">
        {{ t("components.pages.Game.AvailableMovesCard.title") }}
      </h2>
    </div>

    <div
      v-if="isWaiting"
      class="available-moves-card__waiting"
      :aria-label="t('components.pages.Game.AvailableMovesCard.waiting')"
    >
      <span class="available-moves-card__waiting-label">
        {{ t("components.pages.Game.AvailableMovesCard.waiting") }}
      </span>
    </div>

    <div
      v-else
      class="available-moves-card__options"
      role="listbox"
      :aria-label="t('components.pages.Game.AvailableMovesCard.title')"
    >
      <button
        v-for="country in props.availableMoves"
        :key="country.code"
        class="available-moves-card__option"
        :class="{
          'available-moves-card__option--selected':
            selectedCountryCode === country.code,
        }"
        type="button"
        role="option"
        :aria-selected="selectedCountryCode === country.code"
        @click="selectCountry(country.code)"
      >
        <img
          class="available-moves-card__flag"
          :src="countryFlagSrc(country.code)"
          :alt="`${country.code} flag`"
          width="24"
          height="18"
        />
        <span class="available-moves-card__option-label">{{
          country.code
        }}</span>
      </button>
    </div>

    <Button
      class="available-moves-card__button"
      :disabled="isButtonDisabled"
      @click="emitSelect"
    >
      {{
        t(
          `components.pages.Game.AvailableMovesCard.${props.isSelecting ? "selecting" : "select"}`,
        )
      }}
    </Button>
  </section>
</template>

<style scoped>
.available-moves-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 360px);
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
}

.available-moves-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.available-moves-card__title-icon {
  flex-shrink: 0;
}

.available-moves-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.available-moves-card__options,
.available-moves-card__waiting {
  min-height: 280px;
  max-height: 280px;
}

.available-moves-card__options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  overflow-y: auto;
  padding-right: var(--spacing-xs);
}

.available-moves-card__waiting {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.available-moves-card__waiting-label {
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-copy);
  text-align: center;
}

.available-moves-card__option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  min-height: 48px;
  border: 1px solid transparent;
  border-radius: var(--radius-token-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  color: var(--body);
  text-align: left;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease;
}

.available-moves-card__option:hover {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.available-moves-card__option:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.available-moves-card__option--selected {
  border-color: var(--primary);
  background-color: color-mix(in srgb, var(--primary) 16%, transparent);
  color: var(--on-dark);
}

.available-moves-card__flag {
  width: 24px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 2px;
  object-fit: cover;
}

.available-moves-card__option-label {
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body);
}

.available-moves-card__button {
  width: 100%;
}

@media (max-width: 480px) {
  .available-moves-card {
    width: 100%;
    padding: var(--spacing-md);
  }
}
</style>
