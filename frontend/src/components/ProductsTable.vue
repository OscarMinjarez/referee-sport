<template>
    <div class="d-flex flex-column mx-auto mt-5 border rounded p-3">
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
                    <td>
                        <button v-if="canChange" type="button" class="btn btn-danger mx-1" @click="deleteProduct(product.uuid)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        <button v-if="canChange" type="button" class="btn btn-success mx-1" @click="goToUpdateProduct(product.uuid)">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                    </td>
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

const router = useRouter();
const products = ref([]);
const userRole = ref('');

const canChange = computed(() => {
  return ['admin', 'storage'].includes(userRole.value);
});

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

async function fetchProducts() {
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

onMounted(async function() {
  const user = JSON.parse(window.localStorage.getItem("user"));
  if (user && user.type) {
    userRole.value = user.type;
  }
  products.value = await fetchProducts();
});
</script>