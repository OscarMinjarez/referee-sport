<template>
  <div class="main-content d-flex align-items-center justify-content-center">
    <form @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="product-image" class="form-label">Inserte una imagen</label>
        <input
            class="form-control"
            type="file"
            id="product-image"
            @change="handleImageUpload($event)"
            accept="image/*"/>
        <div v-if="imagePreview" class="mt-2">
          <img :src="imagePreview" alt="Vista previa" class="img-thumbnail" style="max-height: 200px;">
        </div>
      </div>

      <div class="mb-3">
        <label for="product-name">Nombre del producto</label>
        <input
            type="text"
            class="form-control"
            id="product-name"
            v-model="productData.name"
            required/>
      </div>

      <div class="mb-3">
        <label for="product-description">Descripción</label>
        <textarea
            class="form-control"
            placeholder="Ingrese una descripción"
            id="product-description"
            rows="2"
            v-model="productData.description"
        ></textarea>
      </div>

      <div class="d-flex w-100 product-price-stock">
        <div class="mb-3">
          <label for="product-stock">Cantidad en stock</label>
          <input
              type="number"
              class="form-control"
              id="product-stock"
              v-model="productData.stockQuantity"
              required/>
        </div>
        <div class="mb-3">
          <label for="product-price">Precio</label>
          <input
              type="number"
              class="form-control"
              id="product-price"
              v-model="productData.price"
              required/>
        </div>
      </div>

      <div class="mb-3">
        <label for="product-size" class="form-label">Seleccionar talla</label>
        <select
            id="product-size"
            class="form-select"
            v-model="productData.size.size">
          <option value="s">Chica</option>
          <option value="m">Mediana</option>
          <option value="l">Grande</option>
          <option value="xl">Extra grande</option>
          <option value="other">Otra</option>
        </select>
      </div>

      <div class="mb-3">
        <label for="product-tags" class="form-label">Etiquetas (tags)</label>
        <div class="input-group">
          <input
              type="text"
              class="form-control"
              id="product-tags"
              v-model="tagInput"
              @keydown.enter.prevent="addTag"
              placeholder="Escribe una etiqueta y presiona Enter"
          >
          <button class="btn btn-outline-secondary" type="button" @click="addTag">
            Agregar
          </button>
        </div>
        <div class="tags-container mt-2">
        <span
            v-for="(tag, index) in productData.tags"
            :key="index"
            class="badge bg-primary me-1 mb-1"
        >
          {{ tag }}
          <button
              type="button"
              class="btn-close btn-close-white ms-2"
              @click="removeTag(index)"
              aria-label="Remove"
          ></button>
        </span>
        </div>
      </div>

      <div class="d-flex w-100 justify-content-between">
        <button type="button" class="btn btn-outline-secondary" @click="goBack">
          Volver
        </button>

        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Enviando...' : isEditing ? 'Actualizar Producto' : 'Crear Producto' }}
        </button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="alert alert-success mt-3">
        {{ successMessage }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const productData = ref({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  size: {
    size: 'm'
  },
  imagePath: '',
  tags: []
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.match('image.*')) {
    errorMessage.value = 'Por favor, sube solo archivos de imagen';
    return;
  }
  errorMessage.value = '';
  imagePreview.value = URL.createObjectURL(file);
  const reader = new FileReader();
  reader.onload = (e) => {
    productData.value.imagePath = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !productData.value.tags.includes(tag)) {
    productData.value.tags.push(tag);
    tagInput.value = '';
  }
}

function removeTag(index) {
  productData.value.tags.splice(index, 1);
}

async function submitForm() {
  if (!productData.value.name || !productData.value.price || !productData.value.stockQuantity) {
    errorMessage.value = 'Nombre, precio y stock son requeridos';
    return;
  }
  if (!isEditing.value && !productData.value.imagePath) {
    errorMessage.value = 'Por favor, selecciona una imagen';
    return;
  }
  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const payload = {
      name: productData.value.name,
      description: productData.value.description,
      price: productData.value.price,
      stockQuantity: productData.value.stockQuantity,
      size: productData.value.size,
      tags: productData.value.tags
    };
    console.log(payload);
    if (productData.value.imagePath) {
      payload.imagePath = productData.value.imagePath;
    }
    const url = isEditing.value 
      ? `http://localhost:3001/api/products/${productId.value}`
      : 'http://localhost:3001/api/products';
    const method = isEditing.value ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al guardar el producto');
    }
    successMessage.value = isEditing.value 
      ? 'Producto actualizado exitosamente!' 
      : 'Producto creado exitosamente!';
      console.log(payload);
    if (!isEditing.value) {
      setTimeout(() => {
        router.push({ name: 'products' });
      }, 1500);
    }
  } catch (error) {
    console.error('Error:', error);
    errorMessage.value = error.message || 'Error al guardar el producto';
  } finally {
    isSubmitting.value = false;
  }
}

const router = useRouter();
const route = useRoute();

const imagePreview = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const tagInput = ref('');
const isEditing = ref(false);

const productId = ref(null);

function goBack() {
  router.back();
}

async function getProduct() {
  try {
    const response = await fetch(`http://localhost:3001/api/products/${productId.value}`);
    if (!response.ok) {
      throw Error("El producto no existe.");
    }
    const product = await response.json();
    productData.value = {
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      size: {
        size: product.size.size
      },
      imagePath: product.imageUrl,
      tags: product.tags || []
    };
    imagePreview.value = product.imageUrl;
  } catch (e) {
    console.error(e);
    errorMessage.value = "Error al cargar el producto";
    setTimeout(() => {
      router.push({ name: 'products' });
    }, 1500);
  }
}

onMounted(async function() {
  productId.value = route.params?.id;
  if (productId.value) {
    isEditing.value = true;
    await getProduct();
  }
});
</script>

<style scoped>
.main-content {
  width: 100vw;
}

form {
  width: 100%;
  max-width: 600px;
}

.product-price-stock {
  gap: 10px;
}

.product-price-stock > div {
  flex: 1;
  min-width: 0;
}
</style>