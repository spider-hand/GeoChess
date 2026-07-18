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
import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import NavigationHeader from "@/components/shared/NavigationHeader.vue";
import DeleteAccountModal from "@/components/pages/User/DeleteAccountModal.vue";
import CountrySelect from "@/components/pages/User/CountrySelect.vue";

type UserTab = "profile" | "aiGames" | "friendsGames";

const { t } = useI18n();
const router = useRouter();
const { username, userCountry, signOutUser } = useAuth();
const { countryFlagAlt, countryFlagSrc } = useCountry();
const { deleteUserAsync, isDeletingUser, isUpdatingUser, updateUserAsync } =
  useUserQuery();
const activeTab = ref<UserTab>("profile");
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

const selectTab = (tab: UserTab) => {
  activeTab.value = tab;
};

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
  <main class="user-page">
    <NavigationHeader />

    <section class="user-page__content">
      <div class="user-page__tabs-scroll">
        <div class="user-page__tabs" role="tablist">
          <button
            class="user-page__tab"
            :class="{ 'user-page__tab--selected': activeTab === 'profile' }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'profile'"
            @click="selectTab('profile')"
          >
            {{ t("components.pages.User.profile") }}
          </button>
          <button
            class="user-page__tab"
            :class="{ 'user-page__tab--selected': activeTab === 'aiGames' }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'aiGames'"
            @click="selectTab('aiGames')"
          >
            {{ t("components.pages.User.aiGames") }}
          </button>
          <button
            class="user-page__tab"
            :class="{
              'user-page__tab--selected': activeTab === 'friendsGames',
            }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'friendsGames'"
            @click="selectTab('friendsGames')"
          >
            {{ t("components.pages.User.friendsGames") }}
          </button>
        </div>
      </div>

      <section v-if="activeTab === 'profile'" class="user-page__profile">
        <div class="user-page__profile-heading">
          <Avatar :name="username" size="md" />
          <Button
            v-if="!isEditingProfile"
            size="compact"
            @click="startEditingProfile"
          >
            {{ t("components.pages.User.editProfile") }}
          </Button>
        </div>

        <div class="user-page__profile-name">
          <span class="user-page__profile-label">
            {{ t("components.pages.User.name") }}
          </span>
          <template v-if="isEditingProfile">
            <input
              v-model="displayName"
              class="user-page__profile-input"
              :class="{
                'user-page__profile-input--invalid':
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
              class="user-page__error"
            >
              {{ displayNameError }}
            </p>
            <p v-if="profileErrorMessage" class="user-page__error">
              {{ profileErrorMessage }}
            </p>
          </template>
          <span v-else class="user-page__profile-display-name">
            <span>{{ username }}</span>
            <img
              v-if="userCountry"
              class="user-page__profile-flag"
              :src="countryFlagSrc(userCountry)"
              :alt="countryFlagAlt(userCountry)"
            />
          </span>
          <CountrySelect
            v-if="isEditingProfile"
            :country="selectedCountry"
            @select="selectedCountry = $event"
          />
          <div v-if="isEditingProfile" class="user-page__profile-actions">
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
          class="user-page__delete-account"
          variant="danger"
          @click="openDeleteAccountModal"
        >
          {{ t("components.pages.User.deleteAccount") }}
        </Button>
      </section>
    </section>

    <NavigationFooter />

    <DeleteAccountModal
      :error-message="deleteAccountErrorMessage"
      :is-deleting="isDeletingUser"
      :is-open="isDeleteAccountModalOpen"
      @close="closeDeleteAccountModal"
      @delete="deleteAccount"
    />
  </main>
</template>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}

.user-page__content {
  flex: 1;
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.user-page__tabs-scroll {
  max-width: 100%;
  overflow-x: auto;
}

.user-page__tabs {
  display: flex;
  gap: var(--spacing-xs);
  width: max-content;
}

.user-page__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 var(--spacing-xs) var(--spacing-xs);
  border: 0;
  background: transparent;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-button);
  white-space: nowrap;
  cursor: pointer;
  transition: color 160ms ease;
}

.user-page__tab::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 25%;
  height: 3px;
  background-color: transparent;
  transform: translateX(-50%);
}

.user-page__tab:hover,
.user-page__tab:focus-visible,
.user-page__tab--selected {
  color: var(--on-dark);
}

.user-page__tab:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.user-page__tab--selected::after {
  background-color: var(--primary);
}

.user-page__profile {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 480px);
  margin-top: var(--spacing-xl);
}
.user-page__profile-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}
.user-page__profile-name {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.user-page__profile-label {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
}
.user-page__profile-display-name {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  color: var(--on-dark);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
}
.user-page__profile-flag {
  height: 16px;
  width: auto;
}
.user-page__profile-input {
  min-height: 40px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  padding: 0 var(--spacing-sm);
  background: var(--on-primary);
  color: var(--on-dark);
  font: inherit;
}
.user-page__profile-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
.user-page__delete-account {
  align-self: flex-start;
  margin-top: var(--spacing-lg);
}
.user-page__error {
  margin: 0;
  color: var(--danger);
  font-size: var(--font-size-body-sm);
}
</style>
