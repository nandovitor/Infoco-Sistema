
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMailStore } from '@/stores/mail';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Alert from '@/components/ui/Alert.vue';
import Inbox from '@/components/dashboard/mail/Inbox.vue';
import EmailDetail from '@/components/dashboard/mail/EmailDetail.vue';
import ComposeMailModal from '@/components/dashboard/mail/ComposeMailModal.vue';
import type { ZohoEmailListItem } from '@/types';
import { LogIn, Mail } from 'lucide-vue-next';

const mailStore = useMailStore();

const selectedEmail = ref<ZohoEmailListItem | null>(null);
const isComposeOpen = ref(false);

onMounted(() => {
  if (mailStore.isAuthenticated) {
    mailStore.listEmails();
  }
});

const handleDisconnect = () => {
  mailStore.disconnect();
  selectedEmail.value = null;
};
</script>

<template>
  <div class="h-[calc(100vh-160px)]">
    <Card v-if="!mailStore.isAuthenticated" class="flex flex-col items-center justify-center text-center p-10 h-full">
      <Mail :size="48" class="text-blue-500 mb-4" />
      <h2 class="text-2xl font-semibold text-gray-800">Conectar ao ZOHO Mail</h2>
      <p class="text-gray-600 mt-2 mb-6 max-w-md">Para gerenciar, ler e enviar e-mails, você precisa conectar sua conta do Zoho Mail ao sistema.</p>
      <Alert v-if="mailStore.error" type="danger" :message="mailStore.error" />
      <Button @click="mailStore.connect" :is-loading="mailStore.isConnecting" size="lg">
        <LogIn :size="18" class="mr-2" />
        Conectar com ZOHO Mail
      </Button>
    </Card>

    <div v-else class="h-full flex flex-col gap-4">
      <div class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
        <div>
          <p class="font-semibold text-gray-800">Caixa de Entrada</p>
          <p class="text-sm text-gray-500">{{ mailStore.accountInfo?.primaryEmailAddress }}</p>
        </div>
        <Button @click="handleDisconnect" variant="danger" size="sm">Desconectar</Button>
      </div>

      <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        <div class="lg:col-span-1 bg-white rounded-lg shadow-sm flex flex-col overflow-y-auto">
          <Inbox
            @select-email="selectedEmail = $event"
            :selected-email-id="selectedEmail?.messageId"
            @compose="isComposeOpen = true"
          />
        </div>
        <div class="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-y-auto">
          <EmailDetail :email="selectedEmail" />
        </div>
      </div>
    </div>

    <ComposeMailModal :is-open="isComposeOpen" @close="isComposeOpen = false" />
  </div>
</template>
