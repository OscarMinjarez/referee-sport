<template>
  <div class="card p-2">
    <img src="../assets/test.jpg" class="card-img"/>
    <div class="card-body">
      <h5 class="card-title">{{ productName }}</h5>
      <div class="d-flex justify-content-between">
        <p class="card-text">${{ productPrice }}</p>
        <p class="card-text"><b>Disponibles: {{ productStock }}</b></p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  productName: {
    type: String,
    required: true,
    default: "Sin nombre"
  },
  productPrice: {
    type: Number,
    required: true,
    default: 0
  },
  productStock: {
    type: Number,
    required: true,
    default: 0
  }
});
</script>

<style scoped>
.card {
  max-width: 18rem;
}
</style>