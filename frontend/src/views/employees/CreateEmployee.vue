<template>
    <div class="container my-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h4 class="mb-0">Registrar Nuevo Empleado</h4>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="submitForm">
                            <div class="mb-3">
                                <label for="username" class="form-label">Nombre de usuario</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="username" 
                                    v-model="employee.username" 
                                    required
                                />
                            </div>

                            <div class="mb-3">
                                <label for="email" class="form-label">Correo electrónico</label>
                                <input 
                                    type="email" 
                                    class="form-control" 
                                    id="email" 
                                    v-model="employee.email" 
                                    required
                                />
                            </div>

                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña</label>
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    id="password" 
                                    v-model="employee.password" 
                                    required
                                    minlength="6"
                                />
                                <div class="form-text">Mínimo 6 caracteres</div>
                            </div>

                            <div class="mb-4">
                                <label for="role" class="form-label">Rol del empleado</label>
                                    <select 
                                    class="form-select" 
                                    id="role" 
                                    v-model="employee.type" 
                                    required
                                    >
                                    <option value="" disabled selected>Seleccione un rol</option>
                                    <option value="sales">Ventas</option>
                                    <option value="store">Almacén</option>
                                </select>
                            </div>

                            <div class="d-flex justify-content-between">
                                <button type="button" class="btn btn-secondary" @click="goBack">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    Registrar Empleado
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { EMPLOYEES_API } from '../../constants';

const router = useRouter();

const employee = ref({
    username: '',
    email: '',
    password: '',
    type: ''
});

async function submitForm() {
    try {
        if (!['sales', 'store'].includes(employee.value.type)) {
            alert('Por favor seleccione un rol válido');
            return;
        }
        const payload = {
            username: employee.value.username,
            email: employee.value.email,
            type: employee.value.type,
            password: employee.value.password
        };
        const response = await fetch(`${EMPLOYEES_API}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar empleado');
        }
        alert('Empleado registrado exitosamente');
        router.push('/app/employees');
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Ocurrió un error al registrar el empleado');
    }
}

function goBack() {
    router.go(-1);
}
</script>
