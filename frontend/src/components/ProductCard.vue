  <template>
    <router-link :to="`/app/details/${productUuid}`" class="text-decoration-none text-dark">
      <div class="card" style="width: 18rem; cursor: pointer;">
        <img :src="productImage" class="card-img-top" :alt="productName">
        <div class="card-body">
          <h5 class="card-title">{{ productName }}</h5>
          <p class="card-text">Precio: ${{ productPrice }}</p>
          <p class="card-text">Stock: {{ productStock }}</p>
        </div>
      </div>
    </router-link>
  </template>

  <script setup>
  defineProps({
    productUuid: {
      type: String,
      required: true
    },
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
