
<script setup lang="ts">
defineEmits(['click']);
</script>

<template>
  <a
    href="#"
    @click.prevent="$emit('click')"
    class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center"
    role="menuitem"
  >
    <slot></slot>
  </a>
</template>
