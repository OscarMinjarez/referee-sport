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
<!--            <ListGroupItem label="Clientes" icon="fa-solid fa-user-tag" />-->
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
            <td>{{ product.stockQuantity }}</td>
            <td>{{ product.price }}</td>
            <td class="d-flex gap-1 justify-content-center">
              <button type="button" class="btn btn-danger">
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