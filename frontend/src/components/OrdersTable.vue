<template>
    <div class="d-flex flex-column mx-auto mt-5 border rounded p-3">
        <div class="d-flex justify-content-between gap-3">
            <div class="input-group mb-3 w-50">
                <span class="input-group-text" id="basic-addon1">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <input type="text" class="form-control" placeholder="Buscar orden">
            </div>

            <div>
                <button type="button" class="btn btn-primary" @click="goToCreateOrder">Registrar nueva orden</button>
            </div>
        </div>

        <Table class="text-center border">
            <thead>
                <tr>
                    <th scope="col">No. Orden</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr class="align-middle" v-for="(order, index) in orders" :key="order.uuid">
                    <td>{{ order.numberOrder }}</td>
                    <td>{{ order.customer.name }} {{ order.customer.lastName }}</td>
                    <td>
                        <span>
                            {{
                                order.state === 'pending' ? 'Pendiente' :
                                order.state === 'canceled' ? 'Cancelada' :
                                order.state === 'finished' ? 'Finalizada' :
                                order.state
                            }}
                        </span>
                    </td>
                    <td>
                        <button type="button" class="btn btn-success mx-1" @click="goToUpdateOrder(order.uuid)">
                        <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn btn-secondary mx-1" @click="goToOrderDetails(order.uuid)">
                        <i class="fa-solid fa-eye"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </Table>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Table from './Table.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const orders = ref([]);

async function goToUpdateOrder(orderUuid) {
  await router.push(`create/${orderUuid}`);
}

async function goToOrderDetails(orderUuid) {
  await router.push(`sales/order/${orderUuid}`);
}

function logout() {
  window.localStorage.clear("token");
  window.localStorage.clear("user");
  router.push("/app/login");
}

onMounted(async function() {
    orders.value = await getOrders();
});

async function getOrders() {
    try {
        const response = await fetch("http://localhost:3001/api/orders");
        if (!response.ok) {
            throw Error("Tuvismos problemas para conectarnos al server.");
        }
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

async function goToCreateOrder() {
    await router.push("create")
}
</script>