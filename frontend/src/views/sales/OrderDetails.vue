<template>
  <div class="container mt-4">

    <div class="card mb-4">
      <div class="card-header">
        <h2 class="mb-0">Detalle de Orden #{{ order.numberOrder }}</h2>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h5>Información del Cliente</h5>
            <p><strong>Nombre:</strong> {{ order.customer.name }} {{ order.customer.lastName }}</p>
            <p><strong>Teléfono:</strong> {{ order.customer.phoneNumber }}</p>
            <p><strong>Dirección:</strong> 
              {{ order.customer.addresses.streetName }} #{{ order.customer.addresses.number }}, 
              {{ order.customer.addresses.neighborhood }}, 
              {{ order.customer.addresses.city }}, 
              {{ order.customer.addresses.state }}
            </p>
          </div>
          <div class="col-md-6">
            <h5>Información de la Orden</h5>
            <p><strong>Fecha:</strong> {{ order.date }}</p>
            <p><strong>Total:</strong> ${{ order.total.toFixed(2) }}</p>
            <p><strong>Estado:</strong> 
              <span>
                <!-- {{ translateStatus(getCurrentStatus()) }} -->
              </span>
            </p>
            <p><strong>Especificaciones:</strong> {{ order.specifications || 'Ninguna' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header">
        <h4 class="mb-0">Productos</h4>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <Table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.orderItems" :key="item.uuid">
                <td>
                  <div class="d-flex align-items-center">
                    <img :src="item.product.imageUrl" 
                         :alt="item.product.name" 
                         class="img-thumbnail mr-3" 
                         style="width: 60px; height: 60px; object-fit: cover;">
                    <div class="mx-2">
                      <h6 class="mb-0">{{ item.product.name }}</h6>
                      <small class="text-muted">{{ item.product.description }}</small>
                    </div>
                  </div>
                </td>
                <td>${{ (item.totalPrice / item.quantity).toFixed(2) }}</td>
                <td>{{ item.quantity }}</td>
                <td>${{ item.totalPrice.toFixed(2) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                <td><strong>${{ order.total.toFixed(2) }}</strong></td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header">
        <h4 class="mb-0">Pagos</h4>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <Table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in order.payments" :key="payment.uuid">
                <td>{{ payment.date }}</td>
                <td>${{ payment.total.toFixed(2) }}</td>
                <td>
                  <span :class="payment.paymentState ? 'badge bg-success' : 'badge bg-warning'">
                    {{ payment.paymentState ? 'Completado' : 'Pendiente' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h4 class="mb-0">Historial de Cambios</h4>
      </div>
      <div class="card-body">
        <ul class="timeline">
          <li v-for="history in sortedHistory" :key="history.uuid" class="mb-3">
            <div class="d-flex justify-content-between">
              <div>
                <strong>{{ translateStatus(history.event.event) }}</strong>
                <p class="mb-0 small text-muted">
                  Por: {{ history.employee.username }} ({{ history.employee.email }})
                </p>
              </div>
              <div class="text-end">
                <small class="text-muted">{{ history.date }}</small>
              </div>
            </div>
            <div class="mt-2" v-if="shouldShowDetails(history.event.event)">
              <p class="mb-0 small">Se realizaron modificaciones en la orden</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Botones de acciones -->
    <div class="mt-4 d-flex justify-content-end">
      <button class="btn btn-outline-secondary me-2" @click="goBack">
        <i class="bi bi-arrow-left"></i> Volver
      </button>
      <button v-if="canEdit" class="btn btn-primary me-2" @click="editOrder">
        <i class="bi bi-pencil"></i> Editar
      </button>
      <button v-if="canCancel" class="btn btn-danger" @click="cancelOrder">
        <i class="bi bi-x-circle"></i> Cancelar
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Table from '../../components/Table.vue';

const route = useRoute();

const order = ref({
  numberOrder: 0,
  orderItems: [],
  total: 0,
  date: '',
  payments: [],
  specifications: '',
  customer: {
    name: '',
    lastName: '',
    phoneNumber: '',
    addresses: {
      streetName: '',
      number: '',
      zipCode: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  },
  historyOrders: []
});
const loading = ref(false);
const error = ref(null);

async function fetchOrder() {
  const id = route.params.id;
  try {
    loading.value = true;
    const response = await fetch(`http://localhost:3001/api/orders/${id}`);
    if (!response.ok) {
      throw new Error('Orden no encontrada');
    }
    order.value = await response.json();
  } catch (e) {
    console.error('Error fetching order:', e);
  } finally {
    loading.value = false;
  }
}

function getCurrentStatus() {
  if (this.order.historyOrders.length === 0) return 'purchased';
  const lastEvent = this.sortedHistory[0].event.event;
  return lastEvent;
}

onMounted(async function() {
  await fetchOrder();
});
</script>

<style scoped>
.timeline {
  list-style: none;
  padding: 0;
  position: relative;
}

.timeline:before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  width: 2px;
  background: #dee2e6;
  margin-left: -1.5px;
}

.timeline > li {
  position: relative;
  padding-left: 3rem;
}

.timeline > li:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6c757d;
  margin-left: 1px;
}

.card-header h2, .card-header h4 {
  font-weight: 600;
}

.img-thumbnail {
  border-radius: 4px;
}
</style>