<template>
    <div class="order-form p-4">
        <h2>{{ isEditMode ? 'Editar orden' : 'Registrar nueva orden' }}</h2>
    
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
                <button type="button" class="btn btn-secondary" @click="registerCustomer(customer)">
                    Registrar cliente
                </button>
            </div>
        </form>

        <h4 class="mt-5">Especificaciones</h4>
        <div class="mb-3">
            <label class="form-label">Notas adicionales</label>
            <textarea 
                v-model="specifications" 
                class="form-control" 
                rows="3"
                placeholder="Ingrese cualquier especificación especial para la orden..."
            ></textarea>
        </div>
    
        <h4 class="mt-5">Productos</h4>
        <Table class="table table-bordered mt-3">
            <thead>
                <tr>
                    <th>Cantidad</th>
                    <th>Producto</th>
                    <th>Detalle</th>
                    <th>Costo</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in orderItems" :key="index">
                    <td>
                        <input 
                            v-model="item.quantity" 
                            type="number" 
                            min="1" 
                            :max="getMaxQuantity(item.product)"
                            @input="updateQuantity(item)"
                            class="form-control form-control-sm"
                        />
                    </td>
                    <td>{{ item.product.name }}</td>
                    <td>{{ item.product.description }}</td>
                    <td>${{ item.totalPrice.toFixed(2) }}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" @click="removeItem(index)">Eliminar</button> <!-- Botón para eliminar -->
                    </td>
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
    
        <div class="mt-4 d-flex justify-content-between">
          <button type="button" class="btn btn-outline-secondary" @click="goBack">
            Volver
          </button>

          <button class="btn btn-success" @click="isEditMode ? updateOrder() : submitOrder()">
              {{ isEditMode ? 'Actualizar orden' : 'Registrar orden' }}
          </button>
        </div>
    </div>

    <BaseModal :show="showCustomerModal" @close="showCustomerModal = false">
        <h5>Buscar Cliente</h5>
        <Table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="customerItem in customers" :key="customerItem.uuid">
                    <td>{{ customerItem.name }}</td>
                    <td>{{ customerItem.lastName }}</td>
                    <td>{{ customerItem.phoneNumber }}</td>
                    <td>
                        {{ customerItem.addresses.streetName }} #{{ customerItem.addresses.number }}, 
                        {{ customerItem.addresses.neighborhood }}, {{ customerItem.addresses.city }}
                    </td>
                    <td>
                        <button
                            class="btn btn-sm btn-primary"
                            @click="handleCustomerSelect(customerItem)">
                            Seleccionar
                        </button>
                    </td>
                </tr>
            </tbody>
        </Table>
    </BaseModal>

    <BaseModal :show="showProductModal" @close="showProductModal = false">
        <h5>Buscar Producto</h5>
        <Table>
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Talla</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td>
                        <img :src="product.imageUrl" alt="Imagen" style="width: 60px; height: 60px; object-fit: cover;" />
                    </td>
                    <td>{{ product.name }}</td>
                    <td>
                        <select
                            v-model="selectedVariants[product.uuid]"
                            class="form-select form-select-sm"
                        >
                            <option
                                    v-for="variant in product.variants"
                                    :key="variant.uuid"
                                    :value="variant.uuid"
                                >
                                {{ variant.size.size.toUpperCase() }} ({{ variant.quantity }} disponibles)
                            </option>
                        </select>
                    </td>
                    <td>
                        <input
                            v-model="selectedQuantities[product.uuid]"
                            type="number"
                            min="1"
                            :max="getMaxQuantity(product)"
                            class="form-control form-control-sm"
                        />
                    </td>
                    <td>
                        <button
                            class="btn btn-sm btn-success"
                            @click="addProduct(product, selectedVariants[product.uuid], selectedQuantities[product.uuid])">
                            Agregar
                        </button>
                    </td>
                </tr>
            </tbody>
        </Table>
    </BaseModal>

    <BaseModal :show="showEmployeeModal" @close="showEmployeeModal = false">
        <h5>Buscar Empleado</h5>
        <Table>
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="employee in employees" :key="employee.uuid">
                    <td>{{ employee.username }}</td>
                    <td>{{ employee.email }}</td>
                    <td>
                        <button
                            class="btn btn-sm btn-primary"
                            @click="handleEmployeeSelect(employee)">
                            Seleccionar
                        </button>
                    </td>
                </tr>
            </tbody>
        </Table>
    </BaseModal>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Table from '../../components/Table.vue';
import BaseModal from '../../components/BaseModal.vue';
import { useRouter, useRoute } from 'vue-router';

const showCustomerModal = ref(false);
const showProductModal = ref(false);
const showEmployeeModal = ref(false);

const selectedVariants = ref({});
const selectedQuantities = ref({});

const route = useRoute();
const router = useRouter();

const isEditMode = ref(false);
const orderUuid = ref('');

const specifications = ref("");

function getMaxQuantity(product) {
    const selectedVariantUuid = selectedVariants.value[product.uuid];
    const selectedVariant = product.variants.find(v => v.uuid === selectedVariantUuid);
    return selectedVariant ? selectedVariant.quantity : 0;
}

function addProduct(product, variantUuid, quantity) {
    if (quantity <= 0) return;
    let selectedPrice = product.price;
    let selectedVariant = null;
    if (product.variants.length > 0 && variantUuid) {
        selectedVariant = product.variants.find(v => v.uuid === variantUuid);
        if (selectedVariant) {
            selectedPrice = selectedVariant.price || product.price;
        }
    }
    const totalPrice = selectedPrice * quantity;
    const item = {
        product,
        variant: selectedVariant,
        quantity,
        totalPrice
    };
    const existingItemIndex = orderItems.value.findIndex(item => item.product.uuid === product.uuid && item.variant?.uuid === variantUuid);
    if (existingItemIndex >= 0) {
        orderItems.value[existingItemIndex].quantity += quantity;
        orderItems.value[existingItemIndex].totalPrice = orderItems.value[existingItemIndex].quantity * selectedPrice;
    } else {
        orderItems.value.push(item);
    }
}

function handleCustomerSelect(selectedCustomer) {
    customer.value = {
        uuid: selectedCustomer.uuid,
        name: selectedCustomer.name,
        lastName: selectedCustomer.lastName,
        phoneNumber: selectedCustomer.phoneNumber,
        address: {
            streetName: selectedCustomer.addresses.streetName,
            number: selectedCustomer.addresses.number,
            zipCode: selectedCustomer.addresses.zipCode,
            neighborhood: selectedCustomer.addresses.neighborhood,
            city: selectedCustomer.addresses.city,
            state: selectedCustomer.addresses.state
        }
    };
    showCustomerModal.value = false;
}

function handleEmployeeSelect(selectedEmployee) {
    employee.value = {
        uuid: selectedEmployee.uuid,
        username: selectedEmployee.username,
        email: selectedEmployee.email
    };
    showEmployeeModal.value = false;
}

function updateQuantity(item) {
    if (item.quantity < 1) item.quantity = 1;
    item.totalPrice = item.quantity * (item.variant?.price || item.product.price);
}

function removeItem(index) {
    orderItems.value.splice(index, 1);
}

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

const products = ref([]);
const employees = ref([]);
const customers = ref([]);

const orderItems = ref([]);

async function openCustomerModal() {
    showCustomerModal.value = true;
    await getCustomers();
}

async function openProductModal() {
    await getProducts();
    selectedVariants.value = {};
    selectedQuantities.value = {};
    if (isEditMode.value) {
        orderItems.value.forEach(item => {
            if (item.variant) {
                selectedVariants.value[item.product.uuid] = item.variant.uuid;
            }
            selectedQuantities.value[item.product.uuid] = item.quantity;
        });
    }
    showProductModal.value = true;
}

async function openEmployeeModal() {
    showEmployeeModal.value = true;
    await getEmployees();
}

async function registerCustomer(customer) {
    try {
        const response = await fetch("http://localhost:3001/api/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customer)
        });
        if (!response.ok) {
            throw new Error("Error al guardar el cliente");
        }
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

async function getProducts() {
    try {
        const response = await fetch("http://localhost:3001/api/products");
        if (!response.ok) {
            throw new Error("Error en el servidor");
        }
        products.value = await response.json();
    } catch (e) {
        console.error(e);
    }
}

async function getEmployees() {
    try {
        const response = await fetch("http://localhost:3001/api/employees");
        if (!response.ok) {
            throw new Error("Error en el servidor");
        }
        employees.value = await response.json();
    } catch (e) {
        console.error(e);
    }
}

async function getCustomers() {
    try {
        const response = await fetch("http://localhost:3001/api/customers");
        if (!response.ok) {
            throw new Error("Error en el servidor");
        }
        customers.value = await response.json();
    } catch (e) {
        console.error(e);
    }
}

function calculateTotal() {
    return orderItems.value.reduce((sum, item) => sum + item.totalPrice, 0);
}

function generateOrderNumber() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

async function goToSales() {
    await router.push("sales");
}

async function submitOrder() {
    try {
        if (!customer.value.uuid) {
            alert('Por favor selecciona un cliente');
            return;
        }
        if (orderItems.value.length === 0) {
            alert('Debes agregar al menos un producto a la orden');
            return;
        }
        if (!employee.value.uuid) {
            alert('Por favor selecciona un empleado');
            return;
        }
        const orderPayload = {
            numberOrder: generateOrderNumber(),
            total: calculateTotal(),
            specifications: specifications.value || "Sin especificaciones",
            date: new Date().toISOString(),
            customerId: customer.value.uuid,
            employeeId: employee.value.uuid,
            orderItems: orderItems.value.map(item => ({
                productId: item.product.uuid,
                variantId: item.variant?.uuid || null,
                quantity: item.quantity,
                totalPrice: item.totalPrice
            })),
            payments: [{
                total: calculateTotal()
            }]
        };
        const response = await fetch("http://localhost:3001/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderPayload)
        });
        if (response) {
            alert('Orden registrada exitosamente');
            goToSales();
        }
    } catch (error) {
        console.error('Error al registrar la orden:', error);
        alert('Ocurrió un error al registrar la orden');
    }
}

async function loadOrderData() {
  try {
    const response = await fetch(`http://localhost:3001/api/orders/${orderUuid.value}`);
    if (!response.ok) {
      throw new Error("Error al cargar la orden");
    }
    const orderData = await response.json();
    specifications.value = orderData.specifications;
    customer.value = {
      uuid: orderData.customer.uuid,
      name: orderData.customer.name,
      lastName: orderData.customer.lastName,
      phoneNumber: orderData.customer.phoneNumber,
      address: {
        streetName: orderData.customer.addresses?.streetName || '',
        number: orderData.customer.addresses?.number || '',
        zipCode: orderData.customer.addresses?.zipCode || '',
        neighborhood: orderData.customer.addresses?.neighborhood || '',
        city: orderData.customer.addresses?.city || '',
        state: orderData.customer.addresses?.state || ''
      }
    };
    if (orderData.historyOrders?.length > 0) {
      employee.value = {
        uuid: orderData.historyOrders[0].employee.uuid,
        username: orderData.historyOrders[0].employee.username,
        email: orderData.historyOrders[0].employee.email
      };
    }
    orderItems.value = orderData.orderItems.map(item => {
      let variant = null;
      if (item.variantId && item.product?.variants) {
        variant = item.product.variants.find(v => v.uuid === item.variantId);
      }
      return {
        product: {
          uuid: item.product.uuid,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          variants: item.product.variants || []
        },
        variant: variant,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      };
    });
    products.value = [...new Set(orderData.orderItems.map(item => item.product))];
  } catch (error) {
    console.error('Error al cargar la orden:', error);
    alert('No se pudo cargar la orden para edición');
    router.push({ name: 'sales' });
  }
}

async function updateOrder() {
  try {
    if (!customer.value.uuid) {
      alert('Por favor selecciona un cliente');
      return;
    }
    if (orderItems.value.length === 0) {
      alert('Debes agregar al menos un producto a la orden');
      return;
    }
    if (!employee.value.uuid) {
      alert('Por favor selecciona un empleado');
      return;
    }
    const orderPayload = {
      numberOrder: generateOrderNumber(),
      total: calculateTotal(),
      specifications: specifications.value,
      date: new Date().toISOString(),
      customerId: customer.value.uuid,
      employeeId: employee.value.uuid,
      orderItems: orderItems.value.map(item => ({
        productId: item.product.uuid,
        variantId: item.variant?.uuid || null,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      })),
      payments: [{
        total: calculateTotal()
      }]
    };
    const response = await fetch(`http://localhost:3001/api/orders/${orderUuid.value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderPayload)
    });
    if (response.ok) {
      alert('Orden actualizada exitosamente');
      goToSales();
    } else {
      throw new Error("Error al actualizar la orden");
    }
  } catch (error) {
    console.error('Error al actualizar la orden:', error);
    alert('Ocurrió un error al actualizar la orden');
  }
}

function goBack() {
  router.back();
}

onMounted(async function() {
  if (route.params.id) {
    isEditMode.value = true;
    orderUuid.value = route.params.id;
    await loadOrderData();
  }
});
</script>
