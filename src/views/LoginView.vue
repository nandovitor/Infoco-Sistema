
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Alert from '@/components/ui/Alert.vue';
import { Building, Mail, Lock, Eye, EyeOff } from 'lucide-vue-next';

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const isShaking = ref(false);
const showPassword = ref(false);

const authStore = useAuthStore();
const dataStore = useDataStore();

const handleLogin = async () => {
  error.value = null;
  if (!email.value || !password.value) {
    error.value = 'Email e senha são obrigatórios.';
    triggerShake();
    return;
  }
  try {
    await authStore.login(email.value, password.value);
    // O router guard irá redirecionar automaticamente
  } catch (err: any) {
    error.value = err.message || 'Falha ao autenticar.';
    triggerShake();
  }
};

const triggerShake = () => {
  isShaking.value = true;
  setTimeout(() => (isShaking.value = false), 500);
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-500"
      :class="{ 'animate-shake': isShaking }"
    >
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full mb-4 shadow-lg overflow-hidden">
          <img v-if="dataStore.loginScreenImageUrl" :src="dataStore.loginScreenImageUrl" alt="Logo do Sistema" class="w-full h-full object-cover" />
          <Building v-else class="text-white w-10 h-10" />
        </div>
        <h1 class="text-3xl font-bold text-gray-800">INFOCO</h1>
        <p class="text-gray-500">Gestão Pública</p>
      </div>

      <Alert v-if="error" type="danger" :message="error" />

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="text-sm font-medium text-blue-700 block mb-2">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            v-model="email"
            :icon="Mail"
            :disabled="authStore.isLoading"
            required
          />
        </div>
        <div>
          <label class="text-sm font-medium text-blue-700 block mb-2">Senha</label>
          <div class="relative">
            <Input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Sua senha"
              v-model="password"
              :icon="Lock"
              :disabled="authStore.isLoading"
              required
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <a href="#" class="text-sm text-blue-600 hover:underline">Esqueceu a senha?</a>
        </div>
        <Button type="submit" class="w-full" :is-loading="authStore.isLoading">
          Entrar no Sistema
        </Button>
      </form>
      <p class="text-center text-xs text-gray-400 pt-4 border-t mt-6">
        &copy; {{ new Date().getFullYear() }} Infoco Gestão Pública. Todos os direitos reservados.
      </p>
    </div>
    <style>
      @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      .animate-shake { animation: shake 0.5s ease-in-out; }
    </style>
  </div>
</template>
