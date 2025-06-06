<template>
    <div class="mt-4 d-flex justify-content-center gap-2">
        <button class="btn btn-outline-primary" @click="handlePreviousPage" :disabled="page <= 1">
            Anterior
        </button>
        <span class="align-self-center">Página {{ page }}</span>
        <button class="btn btn-outline-primary" @click="handleNextPage" :disabled="page >= lastPage">
            Siguiente
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    page: {
        type: Number,
        required: false,
        default: 1
    },
    lastPage: {
        type: Number,
        required: false,
        default: 1
    }
});

const emits = defineEmits(['nextPage', 'previousPage']);

function handleNextPage() {
    emits('nextPage');
}

function handlePreviousPage() {
    emits('previousPage');
}
</script>