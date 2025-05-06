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

      <div class="mb-3">
        <label for="product-price">Precio</label>
        <input
            type="number"
            class="form-control"
            id="product-price"
            v-model.number="productData.price"
            min="0"
            step="0.01"
            required/>
      </div>

      <div class="mb-3">
        <label class="form-label">Tallas y cantidades</label>
        <div class="variant-grid">
          <div class="variant-row" v-for="(variant, index) in defaultVariants" :key="index">
            <div class="variant-size">{{ sizeLabels[variant.size] }}</div>
            <input
                type="number"
                class="form-control variant-quantity"
                v-model.number="variant.quantity"
                placeholder="0"
                min="0"
                @input="calculateTotalStock"
            >
          </div>
        </div>
        <div class="mt-2">
          <strong>Stock total:</strong> {{ productData.stockQuantity }} unidades
        </div>
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
              v-for="(tag, index) in productData.tagNames"
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

const router = useRouter();
const route = useRoute();

const sizeLabels = {
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL'
};

const productData = ref({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  variants: [],
  imagePath: '',
  tagNames: []
});

const defaultVariants = ref([
  { size: 's', quantity: 0 },
  { size: 'm', quantity: 0 },
  { size: 'l', quantity: 0 },
  { size: 'xl', quantity: 0 }
]);

const imagePreview = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const tagInput = ref('');
const isEditing = ref(false);
const productId = ref(null);

function calculateTotalStock() {
  productData.value.stockQuantity = defaultVariants.value.reduce(
      (total, variant) => total + (parseInt(variant.quantity) || 0),
      0
  );
}

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
  if (tag && !productData.value.tagNames.includes(tag)) {
    productData.value.tagNames.push(tag);
    tagInput.value = '';
  }
}

function removeTag(index) {
  productData.value.tagNames.splice(index, 1);
}

async function submitForm() {
  if (!productData.value.name || !productData.value.price) {
    errorMessage.value = 'Nombre y precio son requeridos';
    return;
  }
  if (productData.value.price <= 0) {
    errorMessage.value = 'El precio debe ser mayor que 0';
    return;
  }
  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const payload = {
      name: productData.value.name,
      description: productData.value.description,
      price: parseFloat(productData.value.price),
      stockQuantity: productData.value.stockQuantity,
      variants: defaultVariants.value
          .filter(variant => variant.quantity > 0)
          .map(variant => ({
            size: variant.size,
            quantity: parseInt(variant.quantity)
          })),
      tagNames: productData.value.tagNames
    };
    if (productData.value.imagePath) {
      payload.imagePath = productData.value.imagePath;
    }
    const url = isEditing.value
        ? `http://localhost:3001/api/products/${productId.value}`
        : 'http://localhost:3001/api/products';

    const method = isEditing.value ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
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

async function getProduct() {
  try {
    const response = await fetch(`http://localhost:3001/api/products/${productId.value}`);
    if (!response.ok) {
      throw Error("El producto no existe.");
    }
    const product = await response.json();
    defaultVariants.value.forEach(variant => {
      variant.quantity = 0;
    });
    if (product.variants?.length > 0) {
      product.variants.forEach(productVariant => {
        const size = productVariant.size?.size || productVariant.size;
        const foundVariant = defaultVariants.value.find(v => v.size === size);
        if (foundVariant) {
          foundVariant.quantity = productVariant.quantity;
        }
      });
    }
    productData.value = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      variants: product.variants || [],
      imagePath: product.imageUrl,
      tagNames: product.tagNames || product.tags?.map(t => t.name) || []
    };
    imagePreview.value = product.imageUrl;
    calculateTotalStock();
  } catch (e) {
    console.error(e);
    errorMessage.value = "Error al cargar el producto";
    setTimeout(() => {
      router.push({ name: 'products' });
    }, 1500);
  }
}

function goBack() {
  router.back();
}

onMounted(async () => {
  productId.value = route.params?.id;
  if (productId.value) {
    isEditing.value = true;
    await getProduct();
  } else {
    defaultVariants.value.forEach(v => v.quantity = 0);
    calculateTotalStock();
  }
});
</script>

<style scoped>
.main-content {
  width: 100vw;
  min-height: 100vh;
  padding: 2rem;
}

form {
  width: 100%;
  max-width: 600px;
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.variant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.variant-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.variant-size {
  min-width: 40px;
  font-weight: 500;
}

.variant-quantity {
  max-width: 100px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35em 0.65em;
}

.btn-close {
  font-size: 0.75rem;
  padding: 0.25rem;
}
</style>