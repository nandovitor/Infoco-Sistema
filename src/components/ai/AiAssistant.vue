
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useDataStore } from '@/stores/data';
import Button from '@/components/ui/Button.vue';
import { X, Bot, Send, Sparkles } from 'lucide-vue-next';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const dataStore = useDataStore();
const prompt = ref('');
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

const addMessage = (text: string, sender: 'user' | 'bot') => {
  messages.value.push({ id: Date.now(), text, sender });
  scrollToBottom();
};

watch(() => props.isOpen, (newVal) => {
  if (newVal && messages.value.length === 0) {
    addMessage('Olá! Sou o INFOCO(IA), seu assistente de gestão. Como posso te ajudar hoje?', 'bot');
  }
});

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const handleSubmit = async () => {
  if (!prompt.value.trim() || isLoading.value) return;

  const userMessage = prompt.value;
  addMessage(userMessage, 'user');
  prompt.value = '';
  isLoading.value = true;

  try {
    const botResponse = await dataStore.analyzeWithGemini(userMessage);
    addMessage(botResponse, 'bot');
  } catch (error) {
    addMessage('Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.', 'bot');
    console.error('AI Assistant Error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 translate-x-full"
    enter-to-class="transform opacity-100 translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-x-0"
    leave-to-class="transform opacity-0 translate-x-full"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-30 z-50 md:hidden"
      @click="$emit('close')"
    ></div>
  </transition>

  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 translate-x-full"
    enter-to-class="transform opacity-100 translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-x-0"
    leave-to-class="transform opacity-0 translate-x-full"
  >
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col z-50"
    >
      <header class="flex items-center justify-between p-4 border-b bg-gray-50">
        <div class="flex items-center gap-3">
          <Sparkles class="text-purple-600" />
          <h2 class="text-lg font-semibold text-gray-800">INFOCO(IA)</h2>
        </div>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-800">
          <X :size="24" />
        </button>
      </header>

      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-for="message in messages" :key="message.id" class="flex" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
          <div
            class="max-w-[80%] rounded-2xl px-4 py-2"
            :class="{
              'bg-blue-600 text-white rounded-br-none': message.sender === 'user',
              'bg-gray-200 text-gray-800 rounded-bl-none': message.sender === 'bot'
            }"
          >
            <p class="text-sm" v-html="message.text.replace(/\n/g, '<br>')"></p>
          </div>
        </div>
        <div v-if="isLoading" class="flex justify-start">
            <div class="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-2">
                <Bot :size="20" class="animate-pulse" />
                <span class="text-sm italic">Digitando...</span>
            </div>
        </div>
      </div>

      <footer class="p-4 border-t bg-gray-50">
        <form @submit.prevent="handleSubmit" class="flex items-center gap-2">
          <input
            v-model="prompt"
            type="text"
            placeholder="Digite sua pergunta aqui..."
            class="flex-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isLoading"
          />
          <Button type="submit" :is-loading="isLoading" class="rounded-full !p-3">
            <Send :size="20" />
          </Button>
        </form>
      </footer>
    </div>
  </transition>
</template>
