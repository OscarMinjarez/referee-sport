<template>
    <Teleport to="body">
      <div v-if="show" class="modal-backdrop" @click.self="close">
            <div class="modal-content p-4">
                <slot></slot>
                <button class="btn btn-sm btn-outline-secondary mt-3" @click="close">Cerrar</button>
            </div>
        </div>
    </Teleport>
</template>
  
<script setup>
defineProps({ show: Boolean });
const emit = defineEmits(['close']);

function close() {
    emit('close');
}
</script>
  
<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}
</style>
  