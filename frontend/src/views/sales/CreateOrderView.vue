<template>
    <div class="order-form p-4">
        <h2>Registrar nueva orden</h2>
    
        <h4 class="mt-4">Información del cliente</h4>
        <form class="row g-3">
            <div class="col-md-6">
                <label class="form-label">Nombre del cliente</label>
                <input v-model="customer.name" class="form-control" />
            </div>
            <div class="col-md-6">
                <label class="form-label">Apellido</label>
                <input v-model="customer.lastName" class="form-control" />
            </div>
            <div class="col-md-6">
                <label class="form-label">Teléfono</label>
                <input v-model="customer.phoneNumber" class="form-control" />
            </div>
            <div class="col-md-6">
                <label class="form-label">Calle</label>
                <input v-model="customer.address.streetName" class="form-control" />
            </div>
            <div class="col-md-3">
                <label class="form-label">Número</label>
                <input v-model="customer.address.number" class="form-control" />
            </div>
            <div class="col-md-3">
                <label class="form-label">Código postal</label>
                <input v-model="customer.address.zipCode" class="form-control" />
            </div>
            <div class="col-md-3">
                <label class="form-label">Colonia</label>
                <input v-model="customer.address.neighborhood" class="form-control" />
            </div>
            <div class="col-md-3">
                <label class="form-label">Ciudad</label>
                <input v-model="customer.address.city" class="form-control" />
            </div>
            <div class="col-md-3">
                <label class="form-label">Estado</label>
                <input v-model="customer.address.state" class="form-control" />
            </div>
    
            <div class="col-12">
                <button type="button" class="btn btn-primary me-2" @click="openCustomerModal">
                    Buscar cliente
                </button>
                <button type="button" class="btn btn-secondary" @click="registerCustomer">
                    Registrar cliente
                </button>
            </div>
        </form>
    
        <h4 class="mt-5">Productos</h4>
        <Table class="table table-bordered mt-3">
            <thead>
                <tr>
                    <th>Cantidad</th>
                    <th>Producto</th>
                    <th>Detalle</th>
                    <th>Costo</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in orderItems" :key="index">
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.product.name }}</td>
                    <td>{{ item.product.description }}</td>
                    <td>${{ item.totalPrice.toFixed(2) }}</td>
                </tr>
            </tbody>
        </Table>
        <button class="btn btn-outline-primary mt-2" @click="openProductModal">
            Agregar producto
        </button>
    
        <h4 class="mt-5">Empleado</h4>
        <div class="row">
            <div class="col-md-6">
                <input v-model="employee.username" class="form-control" placeholder="Nombre de usuario" />
            </div>
            <div class="col-md-6">
                <input v-model="employee.email" class="form-control" placeholder="Correo" />
            </div>
            <div class="col-12 mt-2">
                <button type="button" class="btn btn-secondary" @click="openEmployeeModal">
                    Buscar empleado
                </button>
            </div>
        </div>
    
        <div class="mt-4 d-flex justify-content-end">
            <button class="btn btn-success" @click="submitOrder">
                Registrar orden
            </button>
        </div>
    </div>

    <BaseModal :show="showCustomerModal" @close="showCustomerModal = false">
        <h5>Buscar Cliente</h5>
        <!-- Aquí va tu buscador de clientes -->
        <!-- Simulamos con un botón -->
        <button class="btn btn-primary mt-2" @click="handleCustomerSelect({ name: 'Laura', lastName: 'González' })">
            Seleccionar a Laura González
        </button>
    </BaseModal>

    <BaseModal :show="showProductModal" @close="showProductModal = false">
        <h5>Buscar Producto</h5>
        <!-- Lista de productos, input de cantidad, etc -->
        <button class="btn btn-primary mt-2" @click="handleProductSelect({ name: 'Producto A', description: 'Detalle', quantity: 1, totalPrice: 200 })">
            Agregar Producto A
        </button>
    </BaseModal>

    <BaseModal :show="showEmployeeModal" @close="showEmployeeModal = false">
        <h5>Buscar Empleado</h5>
        <button class="btn btn-primary mt-2" @click="handleEmployeeSelect({ username: 'LuisRam', email: 'luis@gactus.mx' })">
            Seleccionar LuisRam
        </button>
    </BaseModal>
</template>

<script setup>
import { ref } from 'vue';
import Table from '../../components/Table.vue';
import BaseModal from '../../components/BaseModal.vue';

const showCustomerModal = ref(false);
const showProductModal = ref(false);
const showEmployeeModal = ref(false);

const customer = ref({
  name: '',
  lastName: '',
  phoneNumber: '',
  address: {
    streetName: '',
    number: '',
    zipCode: '',
    neighborhood: '',
    city: '',
    state: ''
  }
});

const employee = ref({
  username: '',
  email: '',
  uuid: ''
});

const orderItems = ref([]);

function openCustomerModal() {
    showCustomerModal.value = true;
}

function openProductModal() {
    showProductModal.value = true;
}

function openEmployeeModal() {
    showEmployeeModal.value = true;
}

function registerCustomer() {
  // POST al endpoint de clientes si no existe
}

function submitOrder() {
  const orderPayload = {
    customer: customer.value,
    employee: employee.value,
    orderItems: orderItems.value,
    total: orderItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
  };

  console.log("Payload para registrar:", orderPayload);
  // Aquí haces el POST a tu endpoint de órdenes
}
</script>
