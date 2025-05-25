<template>
    <div class="container-fluid mt-5">
        <div class="card mx-auto">
            <div class="card-header text-center">
                <h3>Iniciar sesión</h3>
            </div>
            <div class="card-body">
                <form class="row g-3 needs-validation" :class="wasValidated ? 'was-validated' : ''" novalidate>
                    <div class="input-group has-validation">
                        <span class="input-group-text" id="email">
                            <i class="fa-solid fa-envelope"></i>
                        </span>
                        <input v-model="email" type="email" class="form-control" id="email" aria-describedby="inputGroupPrepend" required>
                        <div class="invalid-feedback">
                            Por favor ingrese un email válido.
                        </div>
                    </div>

                    <div class="input-group has-validation">
                        <span class="input-group-text" id="password">
                            <i class="fa-solid fa-key"></i>
                        </span>
                        <input v-model="password" type="password" class="form-control" id="password" aria-describedby="inputGroupPrepend" required>
                        <div class="invalid-feedback">
                            Contraseña inválida.
                        </div>
                    </div>

                    <div class="d-flex w-full justify-content-end">
                        <button :class="loading ? 'disabled' : ''" class="btn btn-primary" type="button" @click="login">
                            <span v-if="!loading">Iniciar sesión</span>
                            <span v-else>Iniciando</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const password = ref("");

const wasValidated = ref(false);
const loading = ref(false);

async function login() {
    wasValidated.value = false;
    if (!email.value && !password.value) {
        wasValidated.value = true;
    }
    try {
        loading.value = true;
        const response = await fetch("http://localhost:3001/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        });
        if (!response.ok) {
            throw new Error("Ocurrió un error desconocido");
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.card {
    max-width: 450px;
}
</style>