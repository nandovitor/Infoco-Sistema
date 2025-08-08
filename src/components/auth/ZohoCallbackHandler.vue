
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMailStore } from '@/stores/mail';
import Spinner from '@/components/ui/Spinner.vue';

const route = useRoute();
const router = useRouter();
const mailStore = useMailStore();

onMounted(async () => {
  // O token vem no fragmento (#) da URL
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    mailStore.saveTokens(params);
    
    if (mailStore.isAuthenticated) {
      await mailStore.listEmails(); // Popula a store com os e-mails
    }
  }
  
  // Redireciona para a página de e-mail
  router.replace({ name: 'zoho-mail' });
});
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center text-center">
    <Spinner size="lg" />
    <p class="mt-4 text-gray-600">Autenticando com o Zoho Mail...</p>
    <p class="text-sm text-gray-500">Você será redirecionado em breve.</p>
  </div>
</template>
