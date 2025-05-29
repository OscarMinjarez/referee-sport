<template>
    <div class="d-flex flex-column mx-auto mt-5 border rounded p-3">
        <div class="d-flex justify-content-between gap-3">
            <div class="input-group mb-3 w-50">
                <span class="input-group-text" id="basic-addon1">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <input type="text" class="form-control" placeholder="Buscar empleado">
            </div>

            <div v-if="canChange">
                <button type="button" class="btn btn-primary" @click="goToUploadEmployee">Registrar empleado</button>
            </div>
        </div>

        <Table class="text-center border">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Usuario</th>
                    <th scope="col">Email</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Fecha de registro</th>
                    <!-- <th v-if="canChange" scope="col">Acción</th> -->
                </tr>
            </thead>
            <tbody>
                <tr class="align-middle" v-for="(employee, index) in employees" :key="employee.uuid">
                    <td scope="1">{{ index + 1 }}</td>
                    <td>{{ employee.username }}</td>
                    <td>{{ employee.email }}</td>
                    <td>{{ getRoleName(employee.type) }}</td>
                    <td>{{ formatDate(employee.createdAt) }}</td>
                    <!-- <td v-if="canChange">
                        <button type="button" class="btn btn-danger mx-1" @click="deleteEmployee(employee.uuid)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        <button type="button" class="btn btn-success mx-1" @click="goToUpdateEmployee(employee.uuid)">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                    </td> -->
                </tr>
            </tbody>
        </Table>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Table from './Table.vue';
import { ref, onMounted } from 'vue';
import { computed } from 'vue';
import { EMPLOYEES_API } from '../constants';

const router = useRouter();
const employees = ref([]);
const userRole = ref('');

const canChange = computed(() => {
  return ['admin'].includes(userRole.value);
});

function goToUploadEmployee() {
    try {
        router.push("create-employee");
    } catch (e) {
        console.error(e);
    }
}

function goToUpdateEmployee(employeeId) {
    try {
        router.push(`create-employees/${employeeId}`);
    } catch (e) {
        console.error(e);
    }
}

function getRoleName(type) {
    const roles = {
        'admin': 'Administrador',
        'store': 'Almacén',
        'sales': 'Ventas'
    };
    return roles[type] || type;
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

async function fetchEmployees() {
    try {
        const response = await fetch(`${EMPLOYEES_API}/employees`);
        if (!response.ok) {
        throw Error("Tuvimos problemas para conectarnos al servidor.");
        }
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

async function deleteEmployee(employeeUuid) {
    try {
        if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
            return;
        }
            const response = await fetch(`${EMPLOYEES_API}/employees/${employeeUuid}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'No se pudo eliminar el empleado');
        }
        employees.value = await fetchEmployees();
        alert('Empleado eliminado correctamente');
    } catch (e) {
        console.error(e);
        alert(e.message || 'Error al eliminar el empleado');
    }
}

onMounted(async function() {
    const user = JSON.parse(window.localStorage.getItem("user"));
    if (user && user.type) {
        userRole.value = user.type;
    }
    employees.value = await fetchEmployees();
});
</script>