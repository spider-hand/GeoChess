<script setup lang="ts">
import { computed } from "vue";

type AvatarSize = "md" | "sm";

defineOptions({
  name: "SharedAvatar",
});

const props = withDefaults(
  defineProps<{
    name?: string | null;
    size?: AvatarSize;
  }>(),
  {
    name: null,
    size: "md",
  },
);

const initials = computed(() => {
  const normalizedName = props.name?.trim();

  if (!normalizedName) {
    return "?";
  }

  const words = normalizedName
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
});
</script>

<template>
  <span class="avatar" :class="`avatar--${size}`" aria-hidden="true">
    {{ initials }}
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-token-full);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
  font-family: var(--font-body);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  text-transform: uppercase;
}

.avatar--md {
  width: 40px;
  height: 40px;
  font-size: var(--font-size-body-md);
}

.avatar--sm {
  width: 32px;
  height: 32px;
  font-size: var(--font-size-body-sm);
}
</style>
