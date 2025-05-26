<template>
  <div class="main-content d-flex">
    <Sidebar />

    <div class="content-wrapper m-5">
      <ProductsTable class="products-content"/>
    </div>
  </div>
</template>

<script setup>
import ProductsTable from "../../components/ProductsTable.vue";
import Sidebar from "../../components/Sidebar.vue";
</script>

<style scoped>
.main-content {
  width: 100vw;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.content-wrapper {
  flex: 1;
  padding-bottom: 40px;
  overflow-y: auto;
}

.products-content {
  width: 100%;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
}
</style>