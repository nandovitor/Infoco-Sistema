
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMailStore } from '@/stores/mail';
import type { ZohoEmailListItem, ZohoEmail } from '@/types';
import Spinner from '@/components/ui/Spinner.vue';
import { formatDate } from '@/lib/utils';
import { MailOpen, AlertCircle, Paperclip, Download } from 'lucide-vue-next';

const props = defineProps<{
  email: ZohoEmailListItem | null;
}>();

const mailStore = useMailStore();
const fullEmail = ref<ZohoEmail | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

watch(() => props.email, async (newEmail) => {
  if (newEmail) {
    isLoading.value = true;
    error.value = null;
    fullEmail.value = null;
    try {
      const details = await mailStore.getEmailDetails(newEmail.messageId);
      fullEmail.value = details;
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar e-mail.';
    } finally {
      isLoading.value = false;
    }
  } else {
    fullEmail.value = null;
  }
});
</script>

<template>
  <div v-if="!email" class="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
    <MailOpen :size="48" class="mb-4" />
    <h3 class="text-lg font-medium">Selecione um e-mail para ler</h3>
    <p class="text-sm">As mensagens da sua caixa de entrada serão exibidas aqui.</p>
  </div>
  <div v-else-if="isLoading" class="h-full flex items-center justify-center">
    <Spinner size="lg" />
  </div>
  <div v-else-if="error" class="h-full flex flex-col items-center justify-center text-red-600 p-8 text-center">
    <AlertCircle :size="48" class="mb-4" />
    <h3 class="text-lg font-medium">Não foi possível carregar o e-mail</h3>
    <p class="text-sm mt-2">{{ error }}</p>
  </div>
  <div v-else-if="fullEmail" class="p-6 h-full overflow-y-auto">
    <h2 class="text-xl font-bold text-gray-800 mb-2">{{ fullEmail.subject }}</h2>
    <div class="border-b pb-4 mb-4">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-3">
          {{ fullEmail.from.name ? fullEmail.from.name.charAt(0).toUpperCase() : '?' }}
        </div>
        <div>
          <p class="font-semibold text-gray-700">{{ fullEmail.from.name }} <span class="text-gray-500 font-normal">&lt;{{ fullEmail.from.emailAddress }}&gt;</span></p>
          <p class="text-sm text-gray-500">Para: {{ fullEmail.to.map(t => t.name || t.emailAddress).join(', ') }}</p>
        </div>
        <div class="ml-auto text-sm text-gray-500 text-right">
          {{ formatDate(fullEmail.receivedTime) }}
          <p>{{ new Date(fullEmail.receivedTime).toLocaleTimeString('pt-BR') }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="fullEmail.attachments && fullEmail.attachments.length > 0" class="mb-4 border-b pb-4">
      <h3 class="text-sm font-semibold flex items-center gap-2 mb-2"><Paperclip :size="16" /> Anexos</h3>
      <div class="flex flex-wrap gap-2">
        <a v-for="att in fullEmail.attachments" :key="att.attachmentId" :href="att.downloadUrl" target="_blank" rel="noopener noreferrer"
           class="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-1.5 rounded-lg transition-colors">
          <span>{{ att.fileName }} ({{ (att.size / 1024).toFixed(1) }} KB)</span>
          <Download :size="14" />
        </a>
      </div>
    </div>
    
    <div class="prose prose-sm max-w-none" v-html="fullEmail.content"></div>
  </div>
</template>
