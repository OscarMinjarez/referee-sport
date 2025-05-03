<template>
  <Navbar class="navbar-fixed" @searchProduct="search"/>

  <!-- Filtros por tag -->
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

  <main class="d-flex">
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

const products = ref([]);
const allProducts = ref([]);
const activeTag = ref(null);

// Función para extraer tags únicos de los productos
const uniqueTags = computed(() => {
  // Creamos un conjunto para almacenar nombres de tags únicos
  const tagSet = new Set();
  
  // Recorremos todos los productos
  allProducts.value.forEach(product => {
    // Si el producto tiene tags, los procesamos
    if (product.tags && Array.isArray(product.tags)) {
      // Agregamos cada nombre de tag al conjunto
      product.tags.forEach(tag => {
        if (tag.name) {
          tagSet.add(tag.name);
        }
      });
    }
  });
  
  // Convertimos el conjunto a un array y lo ordenamos alfabéticamente
  return Array.from(tagSet).sort();
});

// Función helper para calcular el stock total del producto
function getProductStock(product) {
  if (!product.variants || !Array.isArray(product.variants)) {
    return 0;
  }
  
  return product.variants.reduce((total, variant) => total + (variant.quantity || 0), 0);
}

async function getProducts() {
  try {
    const res = await fetch('http://localhost:3001/api/products');
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
}

// Filtrar productos por tag directamente en el front
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
    
    const res = await fetch(`http://localhost:3001/api/products/search/${name}`);
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
    
    console.log('Productos cargados:', productList.length);
    console.log('Tags únicos detectados:', uniqueTags.value);
  } catch (err) {
    console.error('Error al cargar datos:', err);
  }
});
</script>

<style scoped>
/* Estilos adicionales */
.btn {
  transition: all 0.3s ease;
}
</style>