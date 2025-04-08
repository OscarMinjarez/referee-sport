<template>
  <Navbar class="navbar-fixed" @searchProduct="search"/>
  <main class="d-flex">
    <div class="container-fluid d-flex flex-wrap gap-3 justify-content-center my-4">
      <ProductCard v-for="product in products"
        :key="product.uuid"
        :productUuid="product.uuid"
        :productName="product.name"
        :productPrice="product.price"
        :productStock="product.stockQuantity"
        :productImage="product.imageUrl"/>
    </div>
  </main>
</template>

<script setup>
import Navbar from '../../components/Navbar.vue';
import ProductCard from "../../components/ProductCard.vue";
import { ref, onMounted } from 'vue';

const products = ref([]);

async function getProducts() {
  try {
    const response = await fetch("http://localhost:3001/api/products");
    if (!response.ok) {
      throw new Error("No pudimos obtener los productos.");
    }
    return await response.json();
  } catch (e) {
    console.error(e);
  }
}

async function search(product) {
  try {
    const response = await fetch(`http://localhost:3001/api/products/search/${product}`);
    if (!response.ok) {
      throw new Error("No pudimos obtener los productos.");
    }
    products.value = await response.json();
  } catch (e) {
    console.error(e);
  }
}

onMounted(async function() {
  products.value = await getProducts();
});
</script>