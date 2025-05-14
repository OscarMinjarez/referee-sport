<template>
  <Navbar />
  <div class="container-fluid my-5">
    <div
      v-if="product"
      class="card mx-auto rounded-4 p-4 bg-white border-0"
      style="max-width: 1200px;"
    >
      <div class="row g-4">
        <div class="col-md-6 d-flex align-items-center justify-content-center">
          <img
            :src="product.imageUrl"
            :alt="product.name"
            class="img-fluid rounded border"
            style="max-height: 500px; width: 100%; object-fit: contain;"
          />
        </div>

        <div class="col-md-6">
          <div class="card-body">
            <h2 class="card-title mb-3">{{ product.name }}</h2>
            <p class="card-text text-muted">{{ product.description }}</p>

            <ul class="list-group list-group-flush mb-3">
              <li class="list-group-item bg-transparent border-0 px-0">
                <strong>Precio:</strong> ${{ product.price }}
              </li>
<!--              <li class="list-group-item bg-transparent border-0 px-0">-->
<!--                <strong>Disponibles:</strong> {{ product.stockQuantity }} unidades-->
<!--              </li>-->
              <li class="list-group-item bg-transparent border-0 px-0">
                <strong>Tallas disponibles:</strong>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <span
                    v-for="variant in product.variants"
                    :key="variant.uuid"
                    class="badge bg-light text-dark border py-2 px-3"
                  >
                    <span class="fw-bold">{{ variant.size.size.toUpperCase() }}</span>:
                    {{ variant.quantity }} unid.
                  </span>
                </div>
              </li>
              <li class="list-group-item bg-transparent border-0 px-0">
                <strong>Etiquetas:</strong>
                <span
                  v-for="(tag, index) in product.tags"
                  :key="index"
                  class="badge bg-secondary me-1"
                >
                  {{ tag.name }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import Navbar from "../../components/Navbar.vue";

const route = useRoute()
const id = route.params.id

const product = ref(null)

async function getProduct() {
  try {
    const response = await fetch(`http://localhost:3001/api/products/${id}`)
    if (!response.ok) {
      throw new Error('No hay producto.')
    }
    return await response.json()
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  product.value = await getProduct()
})
</script>