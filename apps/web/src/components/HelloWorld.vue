<script setup lang="ts">
import useHealthApi from "@/composables/useHealthApi";

defineProps<{
  name: string;
}>();

const { healthApi } = useHealthApi();

healthApi.getHealth();
</script>

<template>
  <div>
    <h1>Hello {{ name }}!</h1>
  </div>
</template>
