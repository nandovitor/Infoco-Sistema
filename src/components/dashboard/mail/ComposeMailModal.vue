
<script setup lang="ts">
import { ref } from 'vue';
import { useMailStore } from '@/stores/mail';
import Modal from '@/components/ui/Modal.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import Alert from '@/components/ui/Alert.vue';
import { Upload, X } from 'lucide-vue-next';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const mailStore = useMailStore();
const to = ref('');
const subject = ref('');
const content = ref('');
const attachments = ref<File[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const resetForm = () => {
  to.value = '';
  subject.value = '';
  content.value = '';
  attachments.value = [];
  error.value = null;
  success.value = null;
};

const handleClose = () => {
  resetForm();
  emit('close');
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    attachments.value.push(...Array.from(target.files));
  }
};

const removeAttachment = (index: number) => {
  attachments.value.splice(index, 1);
};

const handleSend = async () => {
  if (!to.value || !subject.value || !content.value) {
    error.value = 'Destinatário, assunto e corpo da mensagem são obrigatórios.';
    return;
  }

  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    await mailStore.sendEmail(to.value, subject.value, content.value, attachments.value);
    success.value = 'E-mail enviado com sucesso!';
    setTimeout(() => {
      handleClose();
    }, 2000);
  } catch (err: any) {
    error.value = err.message || 'Falha ao enviar e-mail.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Modal :is-open="isOpen" @close="handleClose" title="Escrever E-mail" size="lg">
    <form @submit.prevent="handleSend" class="space-y-4">
      <Alert v-if="error" type="danger" :message="error" />
      <Alert v-if="success" type="success" :message="success" />

      <Input type="email" placeholder="Para" v-model="to" required :disabled="isLoading" />
      <Input type="text" placeholder="Assunto" v-model="subject" required :disabled="isLoading" />
      <textarea
        v-model="content"
        rows="10"
        class="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        placeholder="Digite sua mensagem aqui..."
        required
        :disabled="isLoading"
      />

      <div>
        <input type="file" ref="fileInput" @change="handleFileChange" multiple class="hidden" />
        <Button type="button" variant="secondary" @click="fileInput?.click()" :disabled="isLoading">
          <Upload :size="16" class="mr-2" />
          Anexar Arquivos
        </Button>
        <div v-if="attachments.length > 0" class="mt-2 space-y-1">
            <div v-for="(file, index) in attachments" :key="index" class="text-sm text-gray-600 flex items-center justify-between bg-gray-100 p-2 rounded">
                <span>{{ file.name }}</span>
                <button @click="removeAttachment(index)" type="button" class="text-red-500 hover:text-red-700">
                    <X :size="16" />
                </button>
            </div>
        </div>
      </div>

      <div class="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="secondary" @click="handleClose" :disabled="isLoading">Cancelar</Button>
        <Button type="submit" :is-loading="isLoading">Enviar</Button>
      </div>
      <p v-if="mailStore.accountInfo?.primaryEmailAddress" class="text-xs text-gray-500 text-right">
        Enviando de: {{ mailStore.accountInfo.primaryEmailAddress }}
      </p>
    </form>
  </Modal>
</template>
