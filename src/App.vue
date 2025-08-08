
<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import Spinner from '@/components/ui/Spinner.vue';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.checkSession();
});
</script>

<template>
  <div v-if="authStore.isAuthLoading" class="flex items-center justify-center min-h-screen bg-gray-100">
    <Spinner size="lg" />
  </div>
  <RouterView v-else />
</template>

<style>
/* Estilos globais podem ser colocados aqui ou em assets/main.css */
</style>
