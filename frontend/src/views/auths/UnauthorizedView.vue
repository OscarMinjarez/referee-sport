<template>
    <div class="container d-flex align-items-center justify-content-center vh-100">
        <div class="text-center">
            <h1 class="display-4 text-danger">Acceso no autorizado</h1>
            <p class="lead">No tienes permisos para acceder a esta página.</p>
            <button class="btn btn-primary mt-3" @click="goToLogin">
                Volver
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goToLogin() {
  router.push({ name: 'login' });
}
</script>
