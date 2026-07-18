<script setup lang="ts">
import { X } from "@lucide/vue";
import { computed, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useField } from "vee-validate";

import useOnClickOutside from "@/composables/useOnClickOutside";
import Button from "@/components/shared/Button.vue";

const props = defineProps<{
  errorMessage: string | null;
  isDeleting: boolean;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  delete: [];
}>();

const { t } = useI18n();
const {
  errorMessage: confirmationErrorMessage,
  handleBlur,
  meta,
  resetField,
  validate,
  value: confirmation,
} = useField<string>(
  "deleteConfirmation",
  (value) =>
    value === "Delete" ||
    t("components.pages.User.DeleteAccountModal.confirmationError"),
  { initialValue: "", validateOnMount: false },
);
const panel = useTemplateRef<HTMLElement>("panel");
const canDelete = computed(
  () => confirmation.value === "Delete" && !confirmationErrorMessage.value,
);
const shouldShowConfirmationError = computed(
  () => (meta.dirty || meta.touched) && Boolean(confirmationErrorMessage.value),
);

const close = () => {
  emit("close");
};

const deleteAccount = async () => {
  if (!(await validate()).valid) {
    return;
  }
  emit("delete");
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      resetField();
    }
  },
);

useOnClickOutside({
  root: panel,
  close: () => {
    if (props.isOpen && !props.isDeleting) {
      close();
    }
  },
});
</script>

<template>
  <Transition appear name="delete-account-modal-fade">
    <div
      v-if="props.isOpen"
      class="delete-account-modal"
      role="presentation"
      @click.self="close"
    >
      <div
        ref="panel"
        class="delete-account-modal__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="t('components.pages.User.DeleteAccountModal.title')"
      >
        <button
          class="delete-account-modal__close-button"
          type="button"
          :disabled="props.isDeleting"
          :aria-label="t('components.pages.User.DeleteAccountModal.close')"
          @click="close"
        >
          <X :size="20" aria-hidden="true" />
        </button>

        <div class="delete-account-modal__content">
          <h2 class="delete-account-modal__title">
            {{ t("components.pages.User.DeleteAccountModal.title") }}
          </h2>
          <p class="delete-account-modal__description">
            {{ t("components.pages.User.DeleteAccountModal.description") }}
          </p>
          <input
            v-model="confirmation"
            class="delete-account-modal__input"
            type="text"
            :disabled="props.isDeleting"
            :aria-label="
              t(
                'components.pages.User.DeleteAccountModal.confirmationPlaceholder',
              )
            "
            :placeholder="
              t(
                'components.pages.User.DeleteAccountModal.confirmationPlaceholder',
              )
            "
            autocomplete="off"
            @blur="handleBlur"
          />
          <p
            v-if="shouldShowConfirmationError"
            class="delete-account-modal__error"
          >
            {{ confirmationErrorMessage }}
          </p>
          <p v-if="props.errorMessage" class="delete-account-modal__error">
            {{ props.errorMessage }}
          </p>
          <div class="delete-account-modal__actions">
            <Button
              variant="secondary"
              :disabled="props.isDeleting"
              @click="close"
            >
              {{ t("components.pages.User.DeleteAccountModal.cancel") }}
            </Button>
            <Button
              variant="danger"
              :disabled="!canDelete"
              :loading="props.isDeleting"
              @click="deleteAccount"
            >
              {{ t("components.pages.User.DeleteAccountModal.delete") }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.delete-account-modal {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background-color: color-mix(in srgb, black 48%, transparent);
}

.delete-account-modal__panel {
  position: relative;
  width: min(100%, 420px);
  padding: var(--spacing-xl);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  box-shadow: 0 24px 48px color-mix(in srgb, black 36%, transparent);
}

.delete-account-modal__close-button {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.delete-account-modal__close-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.delete-account-modal__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.delete-account-modal__title {
  margin: 0;
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
}

.delete-account-modal__description {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body);
}

.delete-account-modal__input {
  min-height: 40px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  padding: 0 var(--spacing-sm);
  background: var(--on-primary);
  color: var(--on-dark);
  font: inherit;
}

.delete-account-modal__error {
  margin: 0;
  color: var(--danger);
  font-size: var(--font-size-body-sm);
}

.delete-account-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.delete-account-modal-fade-enter-active,
.delete-account-modal-fade-leave-active {
  transition: opacity 180ms ease;
}

.delete-account-modal-fade-enter-from,
.delete-account-modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .delete-account-modal {
    padding: var(--spacing-md);
  }

  .delete-account-modal__panel {
    padding: var(--spacing-lg);
  }
}
</style>
