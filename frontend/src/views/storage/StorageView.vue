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
            <ListGroupItem label="Órdenes" icon="fa-solid fa-bag-shopping" @click="openOrdersModal" />
            <ListGroupItem label="Productos" icon="fa-solid fa-box" @click="goToStorage" />
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
          <input type="text" class="form-control" placeholder="Buscar producto">
        </div>

        <div>
          <button type="button" class="btn btn-primary" @click="goToUploadProduct">Registrar producto</button>
        </div>
      </div>

      <Table class="text-center border">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre del producto</th>
            <th scope="col">Stock</th>
            <th scope="col">Precio</th>
            <th scope="col">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr class="align-middle" v-for="(product, index) in products" :key="product.uuid">
            <td scope="1">{{ index + 1 }}</td>
            <td>{{ product.name }}</td>
            <td>{{ getStockQuantity(product) }}</td>
            <td>{{ product.price }}</td>
            <td class="d-flex gap-1 justify-content-center">
              <button type="button" class="btn btn-danger" @click="deleteProduct(product.uuid)">
                <i class="fa-solid fa-trash"></i>
              </button>
              <button type="button" class="btn btn-success" @click="goToUpdateProduct(product.uuid)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
<!--implementacion de luis comentar en caso de falla-->
    <!-- Modal de Órdenes -->
    <div class="modal fade" tabindex="-1" :class="{ show: showOrdersModal }" style="display: block;" v-if="showOrdersModal">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Órdenes registradas</h5>
            <button type="button" class="btn-close" @click="closeOrdersModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="orders.length === 0" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
            <div v-else>
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>No. Orden</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(order, idx) in orders" :key="order.uuid">
                    <tr>
                      <td>{{ idx + 1 }}</td>
                      <td>{{ order.numberOrder }}</td>
                      <td>{{ order.customer?.name }} {{ order.customer?.lastName }}</td>
                      <td>{{ formatDate(order.date) }}</td>
                      <td>${{ order.total }}</td>
                      <td>
                        <button class="btn btn-sm btn-info" @click="toggleOrderDetails(idx)">
                          {{ expandedOrder === idx ? 'Ocultar' : 'Ver' }}
                        </button>
                      </td>
                    </tr>
                    <tr v-if="expandedOrder === idx" :key="order.uuid + '-details'">
                      <td colspan="6">
                        <div>
                          <strong>Productos:</strong>
                          <ul>
                            <li v-for="item in order.orderItems" :key="item.uuid">
                              {{ item.product?.name }} ({{ item.quantity }} unid.) - ${{ item.totalPrice }}
                            </li>
                          </ul>
                          <strong>Pagos:</strong>
                          <ul>
                            <li v-for="payment in order.payments" :key="payment.uuid">
                              ${{ payment.total }} - {{ payment.paymentState ? 'Pagado' : 'Pendiente' }}
                            </li>
                          </ul>
                          <strong>Especificaciones:</strong>
                          <div>{{ order.specifications }}</div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeOrdersModal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Fin Modal -->
  </div>
</template>

<script setup>
import Sidebar from "../../components/Sidebar.vue";
import ListGroup from "../../components/ListGroup.vue";
import ListGroupItem from "../../components/ListGroupItem.vue";
import Table from "../../components/Table.vue";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";

const router = useRouter();

const products = ref([]);
const stockQuantity = ref(0);

const showOrdersModal = ref(false);
const orders = ref([]);
const expandedOrder = ref(null);

function goToStorage() {
  router.push("/app/storage");
}

function openOrdersModal() {
  showOrdersModal.value = true;
  fetchOrders();
}

function closeOrdersModal() {
  showOrdersModal.value = false;
  expandedOrder.value = null;
}

function toggleOrderDetails(idx) {
  expandedOrder.value = expandedOrder.value === idx ? null : idx;
}

async function fetchOrders() {
  try {
    const response = await fetch("http://localhost:3001/api/orders");
    if (!response.ok) throw new Error("No se pudieron cargar las órdenes");
    orders.value = await response.json();
  } catch (e) {
    console.error(e);
    orders.value = [];
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString();
}
// aqui acaba la implementacion de luis, comentar en caso de falla
function goToUploadProduct() {
  try {
    router.push("upload")
  } catch (e) {
    console.error(e);
  }
}

function goToUpdateProduct(productId) {
  try {
    router.push(`upload/${productId}`);
  } catch (e) {
    console.error(e);
  }
}

function getStockQuantity(product) {
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    return "Sin stock";
  }
  const totalStock = product.variants.reduce((sum, variant) => {
    const quantity = Number(variant.quantity);
    return sum + (isNaN(quantity) ? 0 : quantity);
  }, 0);
  return totalStock > 0 ? totalStock : "Sin stock";
}

onMounted(async function() {
  products.value = await getProducts();
});

async function getProducts() {
  try {
    const response = await fetch("http://localhost:3001/api/products");
    if (!response.ok) {
      throw Error("Tuvismos problemas para conectarnos al server.");
    }
    return await response.json();
  } catch (e) {
    console.error(e);
  }
}

async function deleteProduct(productUuid) {
  try {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }
    const response = await fetch(`http://localhost:3001/api/products/${productUuid}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'No se pudo eliminar el producto');
    }
    products.value = await getProducts();
    alert('Producto eliminado correctamente');
  } catch (e) {
    console.error(e);
    alert(e.message || 'Error al eliminar el producto');
  }
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