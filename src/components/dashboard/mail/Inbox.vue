
<script setup lang="ts">
import { computed } from 'vue';
import { useMailStore } from '@/stores/mail';
import EmailListItem from './EmailListItem.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Button from '@/components/ui/Button.vue';
import { Edit, RefreshCw, AlertCircle } from 'lucide-vue-next';
import type { ZohoEmailListItem } from '@/types';

defineProps<{
  selectedEmailId?: string;
}>();

const emit = defineEmits<{
  (e: 'selectEmail', email: ZohoEmailListItem | null): void;
  (e: 'compose'): void;
}>();

const mailStore = useMailStore();
const emails = computed(() => mailStore.emails);
const isLoading = computed(() => mailStore.isLoading);
const error = computed(() => mailStore.error);

const fetchEmails = () => {
  mailStore.listEmails();
};
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 border-b flex items-center justify-between gap-2">
      <Button @click="$emit('compose')" size="sm" class="flex-1">
        <Edit :size="16" class="mr-2" /> Escrever
      </Button>
      <Button @click="fetchEmails" variant="secondary" size="sm" class="p-2" :disabled="isLoading">
        <RefreshCw :size="16" :class="{ 'animate-spin': isLoading }" />
      </Button>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <Spinner />
      </div>
      <div v-else-if="error" class="p-4 text-center text-red-600">
        <AlertCircle class="mx-auto w-8 h-8 mb-2" />
        <p class="text-sm">{{ error }}</p>
      </div>
      <div v-else-if="emails.length === 0" class="p-4 text-center text-gray-500">
        <p>Sua caixa de entrada está vazia.</p>
      </div>
      <ul v-else>
        <EmailListItem
          v-for="email in emails"
          :key="email.messageId"
          :email="email"
          :is-selected="email.messageId === selectedEmailId"
          @select="$emit('selectEmail', email)"
        />
      </ul>
    </div>
  </div>
</template>
