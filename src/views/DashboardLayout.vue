
<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import Header from '@/components/dashboard/Header.vue';
import AiAssistant from '@/components/ai/AiAssistant.vue';
import { Bot } from 'lucide-vue-next';

const isAiAssistantOpen = ref(false);
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <div class="flex-1 flex flex-col overflow-hidden relative">
      <Header />
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
        <div class="container mx-auto max-w-7xl">
          <RouterView />
        </div>
      </main>
    </div>

    <button
      @click="isAiAssistantOpen = true"
      class="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-40"
      aria-label="Abrir Assistente de IA"
    >
      <div class="flex items-center gap-2">
        <Bot :size="24" />
        <span class="font-semibold">INFOCO(IA)</span>
      </div>
    </button>

    <AiAssistant
      :is-open="isAiAssistantOpen"
      @close="isAiAssistantOpen = false"
    />
  </div>
</template>
