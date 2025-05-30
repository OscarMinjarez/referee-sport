<template>
  <Navbar class="navbar-fixed" @searchProduct="search"/>

  <main class="d-flex flex-column">
    <div class="d-flex flex-wrap gap-2 justify-content-center my-3">
      <button
        @click="resetFilter"
        class="btn"
        :class="activeTag === null ? 'btn-primary' : 'btn-outline-primary'"
      >
        Todas
      </button>
      <button
        v-for="tag in uniqueTags"
        :key="tag"
        @click="filterByTag(tag)"
        class="btn"
        :class="activeTag === tag ? 'btn-primary' : 'btn-outline-primary'"
      >
        {{ tag }}
      </button>
    </div>

    <div class="container-fluid d-flex flex-wrap gap-3 justify-content-center my-4">
      <ProductCard
        v-for="product in products"
        :key="product.uuid"
        :productUuid="product.uuid"
        :productName="product.name"
        :productPrice="product.price"
        :productStock="getProductStock(product)"
        :productImage="product.imageUrl"
      />
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Navbar from '../../components/Navbar.vue';
import ProductCard from '../../components/ProductCard.vue';
import { EMPLOYEES_API } from "../../constants";

const products = ref([]);
const allProducts = ref([]);
const activeTag = ref(null);

const uniqueTags = computed(() => {
  const tagSet = new Set();
    allProducts.value.forEach(product => {
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach(tag => {
        if (tag.name) {
          tagSet.add(tag.name);
        }
      });
    }
  });
  return Array.from(tagSet).sort();
});

function getProductStock(product) {
  if (!product.productsVariants || !Array.isArray(product.productsVariants)) {
    return 0;
  }
  return product.productsVariants.reduce((total, variant) => total + (variant.quantity || 0), 0);
}

async function getProducts() {
  try {
    const res = await fetch(`${EMPLOYEES_API}/products`);
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
}

function filterByTag(tagName) {
  activeTag.value = tagName;
  
  products.value = allProducts.value.filter(product => 
    product.tags && 
    Array.isArray(product.tags) && 
    product.tags.some(tag => tag.name === tagName)
  );
}

function resetFilter() {
  activeTag.value = null;
  products.value = allProducts.value;
}

async function search(name) {
  try {
    if (!name || name.trim() === '') {
      resetFilter();
      return;
    }
    
    const res = await fetch(`${EMPLOYEES_API}/products/search/${name}`);
    if (!res.ok) throw new Error('Error en búsqueda');
    products.value = await res.json();
    activeTag.value = null; // Resetear tag activo al buscar
  } catch (error) {
    console.error('Error en la búsqueda:', error);
  }
}

onMounted(async () => {
  try {
    const productList = await getProducts();
    allProducts.value = productList;
    products.value = productList;
  } catch (err) {
    console.error('Error al cargar datos:', err);
  }
});
</script>