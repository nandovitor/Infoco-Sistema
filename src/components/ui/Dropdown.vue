
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{ text: string }>();

const isOpen = ref(false);
const dropdown = ref<HTMLElement | null>(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = (e: MouseEvent) => {
  if (dropdown.value && !dropdown.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', close);
});

onUnmounted(() => {
  document.removeEventListener('click', close);
});
</script>

<template>
  <div class="relative inline-block text-left" ref="dropdown">
    <div>
      <button
        @click.prevent="toggle"
        type="button"
        class="inline-flex justify-center items-center w-full rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700/50 focus:outline-none transition-colors"
        id="options-menu"
        aria-haspopup="true"
        :aria-expanded="isOpen"
      >
        <slot name="buttonContent"></slot>
      </button>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        <div class="py-1" role="none" @click="isOpen = false">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>
