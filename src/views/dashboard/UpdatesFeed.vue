
<script setup lang="ts">
import { useDataStore } from '@/stores/data';
import Card from '@/components/ui/Card.vue';
import { formatDate, timeAgo } from '@/lib/utils';
import { Megaphone, User } from 'lucide-vue-next';

const dataStore = useDataStore();
const updates = dataStore.updatePosts;
const users = dataStore.profiles;

const getAuthorName = (authorId: string) => {
    return users.find(u => u.id === authorId)?.name || 'Sistema';
}
</script>
<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <Megaphone :size="32" class="text-indigo-600" />
      <h1 class="text-3xl font-bold text-gray-800">Notas de Atualização</h1>
    </div>
    <div class="space-y-6">
        <Card v-for="update in updates" :key="update.id" class="p-6">
            <p class="text-gray-700 whitespace-pre-wrap">{{ update.content }}</p>
            <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center gap-2">
                    <User :size="14"/>
                    <span>{{ getAuthorName(update.authorId) }}</span>
                </div>
                <time :datetime="update.createdAt" :title="formatDate(update.createdAt)">
                    {{ timeAgo(update.createdAt) }}
                </time>
            </div>
        </Card>
        <Card v-if="updates.length === 0" class="p-10 text-center">
            <p class="text-gray-500">Nenhuma nota de atualização encontrada.</p>
        </Card>
    </div>
  </div>
</template>
