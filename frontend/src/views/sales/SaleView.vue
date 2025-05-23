<template>
    <div class="main-content d-flex">
        <Sidebar class="sidebar p-3 d-flex h-full flex-column gap-2 border justify-content-between">
            <div>
                <div class="card p-2">
                    <div class="img-circle-container">
                        <img
                            class="img-circle"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/TWICE_Jeongyeon_VETERAN_2_September_2024.jpg/640px-TWICE_Jeongyeon_VETERAN_2_September_2024.jpg"/>
                    </div>
                    <div class="card-body text-center fw-bold">
                        <p class="card-text">Oscar Minjarez</p>
                    </div>
                </div>

                <div class="mt-5">
                <ListGroup>
                    <ListGroupItem label="Órdenes" icon="fa-solid fa-bag-shopping" />
                    <ListGroupItem label="Clientes" icon="fa-solid fa-user-tag" />
                    <ListGroupItem label="Productos" icon="fa-solid fa-box" />
                </ListGroup>
                </div>
            </div>

            <div>
                <ListGroup>
                <ListGroupItem label="Cerrar sesión" icon="fa-solid fa-right-from-bracket" />
                </ListGroup>
            </div>
        </Sidebar>

        <div class="products-content d-flex flex-column mx-auto mt-5 border rounded p-3">
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
                        <td class="text-center align-middle d-flex gap-1 justify-content-center">
                          <button type="button" class="btn btn-success" @click="goToUpdateOrder(order.uuid)">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button type="button" class="btn btn-secondary" @click="goToOrderDetails(order.uuid)">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ListGroup from '../../components/ListGroup.vue';
import ListGroupItem from '../../components/ListGroupItem.vue';
import Sidebar from '../../components/Sidebar.vue';
import { useRouter } from 'vue-router';
import Table from '../../components/Table.vue';

const router = useRouter();
const orders = ref([]);

async function goToUpdateOrder(orderUuid) {
  await router.push(`create/${orderUuid}`);
}

async function goToOrderDetails(orderUuid) {
  await router.push(`sales/order/${orderUuid}`);
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

<style scoped>
.main-content {
    width: 100vw;
    height: 100vh;
}

.sidebar {
    width: 250px;
}

.img-circle-container {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto;
}

.img-circle {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.products-content {
    width: 100%;
    max-width: 900px;
}
</style>