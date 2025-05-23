<template>
  <div class="container my-4">

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
            <p><strong>Fecha:</strong> {{ formatDate(order.date) }}</p>
            <p><strong>Total:</strong> ${{ order.total.toFixed(2) }}</p>
            <p><strong>Estado:</strong> <span>
                {{
                  order.state === 'pending' ? 'Pendiente' :
                  order.state === 'canceled' ? 'Cancelada' :
                  order.state === 'finished' ? 'Finalizada' :
                  order.state
                }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="order.specifications">
      <div class="card-header">
        <h5 class="mb-0">Descripción de la Orden</h5>
      </div>
      <div class="card-body">
        <p class="mb-0">{{ order.specifications }}</p>
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
                <th>Estado</th>
                <th>Total</th>
                <th>Pagado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in sortedPayments" :key="payment.uuid">
                <td>{{ formatDate(payment.date) }}</td>
                <td>
                  {{
                    payment.state === 'completed' ? 'Pagado' :
                    payment.state === 'partial' ? 'Parcial' :
                    payment.state === 'canceled' ? 'Cancelado' : 'Pendiente'
                  }}
                </td>
                <td>${{ Number(payment.total).toFixed(2) }}</td>
                <td>${{ Number(payment.amountPaid || 0).toFixed(2) }}</td>
                <td class="d-flex justify-content-center">
                  <button 
                    @click="openPaymentModal(payment)"
                    class="btn btn-sm btn-primary"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right"><strong>Total:</strong></td>
                <td><strong>${{ Number(order.total).toFixed(2) }}</strong></td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </div>
    </div>

    <BaseModal :show="showPaymentModal" @close="showPaymentModal = false">
      <div class="p-4">
        <h4 class="mb-4">Editar Pago</h4>
        
        <div class="mb-3">
          <label class="form-label">Total</label>
          <input 
            type="number" 
            class="form-control" 
            v-model="editingPayment.total"
            step="0.01"
            min="0"
            disabled
          >
        </div>
        
        <div class="mb-3">
          <label class="form-label">Monto Pagado</label>
          <input 
            type="number" 
            class="form-control" 
            v-model="editingPayment.amountPaid"
            step="0.01"
            :max="editingPayment.total"
            min="0"
          >
        </div>
        
        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-outline-secondary me-2" @click="showPaymentModal = false">
            Cancelar
          </button>
          <button class="btn btn-primary" @click="savePayment">
            Guardar
          </button>
        </div>
      </div>
    </BaseModal>

    <div class="card">
      <div class="card-header">
        <h4 class="mb-0">Historial de Cambios</h4>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <Table>
            <thead>
              <tr>
                <th width="40px"></th>
                <th>Evento</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="history in sortedHistory" :key="history.uuid">
                <td class="text-center">
                  <i :class="[getEventIcon(history.event.event)]"></i>
                </td>
                <td>{{ translateStatus(history.event.event) }}</td>
                <td>
                  {{ history.employee.username }}<br>
                  <small class="text-muted">{{ history.employee.email }}</small>
                </td>
                <td>{{ formatDate(history.date) }}</td>
                <td>
                  <span v-if="history.event.event === 'updated'" class="badge bg-info">
                    Modificaciones realizadas
                  </span>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>

    <div class="mt-4 d-flex justify-content-between">
      <button class="btn btn-outline-secondary me-2" @click="goBack">
        <i class="bi bi-arrow-left"></i> Volver
      </button>
      <div>
        <button v-if="canEdit" class="btn btn-primary me-2" @click="editOrder">
          <i class="bi bi-pencil"></i> Editar
        </button>
        <button v-if="canCancel" class="btn btn-danger" @click="cancelOrder">
          <i class="bi bi-x-circle"></i> Cancelar
      </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Table from '../../components/Table.vue';
import BaseModal from '../../components/BaseModal.vue';

const route = useRoute();
const router = useRouter();

const showPaymentModal = ref(false);
const editingPayment = ref({
  uuid: '',
  total: 0,
  amountPaid: 0,
  state: 'pending',
  date: new Date()
});

function openPaymentModal(payment) {
  editingPayment.value = { 
    ...payment,
    amountPaid: payment.amountPaid || 0
  };
  showPaymentModal.value = true;
}

async function savePayment() {
  try {
    if (editingPayment.value.amountPaid > editingPayment.value.total) {
      alert('El monto pagado no puede ser mayor al total');
      return;
    }
    if (editingPayment.value.amountPaid >= editingPayment.value.total) {
      editingPayment.value.state = 'completed';
    } else if (editingPayment.value.amountPaid > 0) {
      editingPayment.value.state = 'partial';
    } else {
      editingPayment.value.state = 'pending';
    }
    const response = await fetch(`http://localhost:3001/api/payments/${editingPayment.value.uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amountPaid: editingPayment.value.amountPaid,
        state: editingPayment.value.state
      })
    });
    if (!response.ok) {
      throw new Error('Error al actualizar el pago');
    }
    showPaymentModal.value = false;
    await fetchOrder();
  } catch (error) {
    console.error('Error al guardar el pago:', error);
    alert('Ocurrió un error al guardar los cambios');
  }
}

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

function goBack() {
  router.back();
}

function canEdit() {
  const currentStatus = this.getCurrentStatus();
  return currentStatus !== 'canceled' && currentStatus !== 'finished';
}

function canCancel() {
  const currentStatus = this.getCurrentStatus();
  return currentStatus !== 'canceled' && currentStatus !== 'finished';
}

const loading = ref(false);
const error = ref(null);

function translateStatus(status) {
  const statusMap = {
    'purchased': 'Comprado',
    'finished': 'Finalizado',
    'updated': 'Actualizado',
    'cancelled': 'Cancelado',
  };
  return statusMap[status] || status;
}

const sortedHistory = computed(() => {
  if (!order.value.historyOrders) return [];
  return [...order.value.historyOrders].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
});

const sortedPayments = computed(() => {
  if (!order.value.payments) return [];
  return [...order.value.payments].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
});

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

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

function getEventIcon(event) {
  const icons = {
    'purchased': 'fa-solid fa-cart-plus',
    'finished': 'fa-solid fa-circle-check',
    'updated': 'fa-solid fa-pen',
    'cancelled': 'fa-solid fa-circle-xmark',
    'payment_received': 'fa-solid fa-money-bill-wave',
    'shipped': 'fa-solid fa-truck',
    'delivered': 'fa-solid fa-box-open'
  };
  return icons[event] || 'fa-solid fa-circle-info';
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
  left: 30px;
  width: 2px;
  background: #dee2e6;
}

.timeline > li {
  position: relative;
  padding-left: 60px;
  margin-bottom: 20px;
}

.timeline-badge {
  position: absolute;
  left: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.timeline-panel {
  position: relative;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.bg-primary-subtle {
  background-color: rgba(13, 110, 253, 0.1);
}
.bg-success-subtle {
  background-color: rgba(25, 135, 84, 0.1);
}
.bg-info-subtle {
  background-color: rgba(13, 202, 240, 0.1);
}
.bg-warning-subtle {
  background-color: rgba(255, 193, 7, 0.1);
}
.bg-danger-subtle {
  background-color: rgba(220, 53, 69, 0.1);
}
.bg-secondary-subtle {
  background-color: rgba(108, 117, 125, 0.1);
}
</style>