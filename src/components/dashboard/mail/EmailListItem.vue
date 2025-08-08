
<script setup lang="ts">
import type { ZohoEmailListItem } from '@/types';
import { timeAgo } from '@/lib/utils';

defineProps<{
  email: ZohoEmailListItem;
  isSelected: boolean;
}>();

defineEmits(['select']);
</script>

<template>
  <li @click="$emit('select')" class="cursor-pointer border-b last:border-b-0 hover:bg-gray-50 transition-colors"
      :class="{ 'bg-blue-50 hover:bg-blue-100': isSelected }">
    <div class="p-4">
      <div class="flex justify-between items-start mb-1">
        <p class="font-semibold text-gray-800 truncate" :class="{ 'font-bold': !email.isRead }">
          {{ email.from.name || email.from.emailAddress }}
        </p>
        <time class="text-xs text-gray-500 whitespace-nowrap ml-2">{{ timeAgo(email.receivedTime) }}</time>
      </div>
      <p class="text-sm text-gray-700 truncate" :class="{ 'font-semibold': !email.isRead }">{{ email.subject }}</p>
      <p class="text-xs text-gray-500 mt-1 truncate">{{ email.summary }}</p>
    </div>
  </li>
</template>
