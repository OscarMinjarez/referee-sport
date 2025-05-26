<template>
  <div class="main-content d-flex">
    <Sidebar class="sidebar p-3 d-flex h-full flex-column gap-2 border justify-content-between" />

    <ProductsTable class="products-content"/>
  </div>
</template>

<script setup>
import ProductsTable from "../../components/ProductsTable.vue";
import Sidebar from "../../components/Sidebar.vue";
</script>

<style scoped>
.main-content {
  width: 100vw;
  height: 100vh;
}

.sidebar {
  width: 250px;
}

.products-content {
  width: 100%;
  max-width: 900px;
}
</style>