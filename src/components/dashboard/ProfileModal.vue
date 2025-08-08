
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Modal from '@/components/ui/Modal.vue';
import Button from '@/components/ui/Button.vue';
import Spinner from '@/components/ui/Spinner.vue';
import Alert from '@/components/ui/Alert.vue';
import { getUserInitials } from '@/lib/utils';
import { UploadCloud, User } from 'lucide-vue-next';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const error = ref<string | null>(null);
const isLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const handleFileChange = (event: Event) => {
  error.value = null;
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      error.value = 'O arquivo é muito grande. O limite é de 2MB.';
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      error.value = 'Formato de arquivo inválido. Use JPG, PNG ou WEBP.';
      return;
    }
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    error.value = 'Por favor, selecione um arquivo primeiro.';
    return;
  }
  error.value = null;
  isLoading.value = true;
  try {
    await authStore.uploadProfilePicture(selectedFile.value);
    emit('close');
  } catch (err: any) {
    error.value = err.message || 'Falha no upload da imagem.';
  } finally {
    isLoading.value = false;
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleClose = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  error.value = null;
  emit('close');
};
</script>

<template>
  <Modal :is-open="isOpen" @close="handleClose" title="Alterar Foto de Perfil" size="md">
    <div class="flex flex-col items-center text-center">
      <div class="relative w-40 h-40 rounded-full mb-4">
        <div class="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-5xl overflow-hidden shadow-lg">
          <img v-if="previewUrl || user?.pfp" :src="previewUrl || user?.pfp" alt="User profile" class="w-full h-full object-cover" />
          <span v-else>{{ user ? getUserInitials(user.name) : 'U' }}</span>
        </div>
        <button @click="triggerFileInput" class="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
          <UploadCloud :size="20" class="text-blue-600" />
        </button>
      </div>

      <input type="file" ref="fileInput" @change="handleFileChange" accept="image/png, image/jpeg, image/webp" class="hidden" />
      
      <p v-if="selectedFile" class="text-sm text-gray-600 mb-4">{{ selectedFile.name }}</p>
      <p v-else class="text-sm text-gray-500 mb-4">Selecione uma imagem (JPG, PNG, WEBP) de até 2MB.</p>

      <Alert v-if="error" type="danger" :message="error" class="mb-4 text-left" />
      
      <div class="flex justify-center gap-4 w-full mt-4">
        <Button type="button" variant="secondary" @click="handleClose" :disabled="isLoading">Cancelar</Button>
        <Button type="button" @click="handleUpload" :is-loading="isLoading" :disabled="!selectedFile">Salvar</Button>
      </div>
    </div>
  </Modal>
</template>
