<template>
  <div class="card p-2">
    <!-- Dynamically bind the image source -->
    <img :src="productImage" :alt="productName" class="card-img"/>
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
  },
  productImage: { // New prop for dynamic image
    type: String,
    required: true,
    default: "../assets/test.jpg" // Default to test image if no value provided
  }
});
</script>

<style scoped>
.card {
  max-width: 18rem;
}

.card-img {
  width: 100%;
  height: 150px;
  object-fit: cover; /* Ensure proper image scaling */
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>
