<template>
  <li class="list-group-item list-group-item-action d-flex align-items-center gap-2 justify-content-center">
    <i :class="icon"></i>
    <a>{{ label }}</a>
  </li>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
    default: "fa-solid fa-circle-question"
  },
  label: {
    type: String,
    required: true,
    default: 'Unknown'
  }
});
</script>