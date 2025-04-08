<template>
  <div class="card p-2">
    <img :src="productImage" :alt="productName" class="card-img"/>
    <div class="card-body">
      <h5 class="card-title">{{ productName }}</h5>
      <div class="d-flex justify-content-between">
        <p class="card-text">${{ productPrice }}</p><br />
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
  },
  productImage: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.card {
  max-width: 18rem;
}

.card-img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>
