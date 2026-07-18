<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useField } from "vee-validate";

import { useAuth } from "@/composables/useAuth";
import useCountry from "@/composables/useCountry";
import useUserQuery from "@/composables/useUserQuery";
import Avatar from "@/components/shared/Avatar.vue";
import Button from "@/components/shared/Button.vue";
import CountrySelect from "@/components/pages/User/CountrySelect.vue";
import DeleteAccountModal from "@/components/pages/User/DeleteAccountModal.vue";

const { t } = useI18n();
const router = useRouter();
const { username, userCountry, signOutUser } = useAuth();
const { countryFlagAlt, countryFlagSrc } = useCountry();
const { deleteUserAsync, isDeletingUser, isUpdatingUser, updateUserAsync } =
  useUserQuery();
const isEditingProfile = ref(false);
const isDeleteAccountModalOpen = ref(false);
const {
  errorMessage: displayNameError,
  handleBlur: handleDisplayNameBlur,
  meta: displayNameMeta,
  setValue: setDisplayName,
  validate: validateDisplayName,
  value: displayName,
} = useField<string>(
  "displayName",
  (value) =>
    value?.trim().length > 0 || t("components.pages.User.nameRequiredError"),
  { initialValue: "", validateOnMount: false },
);
const profileErrorMessage = ref<string | null>(null);
const selectedCountry = ref<string | undefined>();
const deleteAccountErrorMessage = ref<string | null>(null);
const canSaveProfile = computed(
  () =>
    displayName.value.trim().length > 0 &&
    displayName.value.trim() !== username.value.trim(),
);

const startEditingProfile = () => {
  profileErrorMessage.value = null;
  setDisplayName(username.value, false);
  selectedCountry.value = userCountry.value;
  isEditingProfile.value = true;
};

const cancelEditingProfile = () => {
  isEditingProfile.value = false;
  profileErrorMessage.value = null;
};

const saveProfile = async () => {
  if (!canSaveProfile.value || !(await validateDisplayName()).valid) {
    return;
  }

  profileErrorMessage.value = null;

  try {
    await updateUserAsync({
      displayName: displayName.value.trim(),
      country: selectedCountry.value,
    });
    isEditingProfile.value = false;
  } catch (error) {
    console.error(error);
    profileErrorMessage.value = t("components.pages.User.saveError");
  }
};

const openDeleteAccountModal = () => {
  deleteAccountErrorMessage.value = null;
  isDeleteAccountModalOpen.value = true;
};

const closeDeleteAccountModal = () => {
  if (isDeletingUser.value) {
    return;
  }

  isDeleteAccountModalOpen.value = false;
  deleteAccountErrorMessage.value = null;
};

const deleteAccount = async () => {
  deleteAccountErrorMessage.value = null;

  try {
    await deleteUserAsync();
    await signOutUser();
    await router.push("/");
  } catch (error) {
    console.error(error);
    deleteAccountErrorMessage.value = t(
      "components.pages.User.DeleteAccountModal.deleteError",
    );
  }
};
</script>

<template>
  <section class="user-profile-section">
    <div class="user-profile-section__heading">
      <Avatar :name="username" size="md" />
      <Button
        v-if="!isEditingProfile"
        size="compact"
        @click="startEditingProfile"
      >
        {{ t("components.pages.User.editProfile") }}
      </Button>
    </div>

    <div class="user-profile-section__name">
      <span class="user-profile-section__label">
        {{ t("components.pages.User.name") }}
      </span>
      <template v-if="isEditingProfile">
        <input
          v-model="displayName"
          class="user-profile-section__input"
          :class="{
            'user-profile-section__input--invalid':
              (displayNameMeta.dirty || displayNameMeta.touched) &&
              displayNameError,
          }"
          type="text"
          @blur="handleDisplayNameBlur"
        />
        <p
          v-if="
            (displayNameMeta.dirty || displayNameMeta.touched) &&
            displayNameError
          "
          class="user-profile-section__error"
        >
          {{ displayNameError }}
        </p>
        <p v-if="profileErrorMessage" class="user-profile-section__error">
          {{ profileErrorMessage }}
        </p>
      </template>
      <span v-else class="user-profile-section__display-name">
        <span>{{ username }}</span>
        <img
          v-if="userCountry"
          class="user-profile-section__flag"
          :src="countryFlagSrc(userCountry)"
          :alt="countryFlagAlt(userCountry)"
        />
      </span>
      <CountrySelect
        v-if="isEditingProfile"
        :country="selectedCountry"
        @select="selectedCountry = $event"
      />
      <div v-if="isEditingProfile" class="user-profile-section__actions">
        <Button
          variant="secondary"
          :disabled="isUpdatingUser"
          @click="cancelEditingProfile"
          >{{ t("components.pages.User.cancel") }}</Button
        >
        <Button
          :disabled="!canSaveProfile"
          :loading="isUpdatingUser"
          @click="saveProfile"
          >{{ t("components.pages.User.saveChanges") }}</Button
        >
      </div>
    </div>

    <Button
      class="user-profile-section__delete-account"
      variant="danger"
      @click="openDeleteAccountModal"
    >
      {{ t("components.pages.User.deleteAccount") }}
    </Button>
  </section>

  <DeleteAccountModal
    :error-message="deleteAccountErrorMessage"
    :is-deleting="isDeletingUser"
    :is-open="isDeleteAccountModalOpen"
    @close="closeDeleteAccountModal"
    @delete="deleteAccount"
  />
</template>

<style scoped>
.user-profile-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 480px);
  margin-top: var(--spacing-xl);
}

.user-profile-section__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.user-profile-section__name {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.user-profile-section__label {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
}

.user-profile-section__display-name {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  color: var(--on-dark);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
}

.user-profile-section__flag {
  height: 16px;
  width: auto;
}

.user-profile-section__input {
  min-height: 40px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  padding: 0 var(--spacing-sm);
  background: var(--surface-card-dark);
  color: var(--on-dark);
  font: inherit;
}

.user-profile-section__input:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.user-profile-section__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.user-profile-section__delete-account {
  align-self: flex-start;
  margin-top: var(--spacing-lg);
}

.user-profile-section__error {
  margin: 0;
  color: var(--danger);
  font-size: var(--font-size-body-sm);
}
</style>
