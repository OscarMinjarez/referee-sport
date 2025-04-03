<template>
    <div class="product-details">
      <!-- Back Button -->
      <button class="btn-back" @click="goBack">← Volver</button>
  
      <!-- Title -->
      <h1 class="product-title">{{ articulo.nombre }}</h1>
  
      <!-- Gallery Section -->
      <div class="gallery">
        <img
          v-for="(img, index) in articulo.fotos"
          :key="index"
          :src="img"
          :alt="`Imagen de ${articulo.nombre}`"
          class="gallery-image"
          @click="selectImage(index)"
        />
      </div>
      <div class="selected-image">
        <img :src="articulo.fotos[activeImageIndex]" :alt="`Vista de ${articulo.nombre}`" />
      </div>
  
      <!-- Price -->
      <div class="price">
        <h2>Precio: ${{ articulo.precio.toFixed(2) }}</h2>
      </div>
  
      <!-- Sizes -->
      <div class="sizes">
        <h3>Tallas Disponibles:</h3>
        <div class="size-options">
          <span
            v-for="talla in articulo.tallas"
            :key="talla"
            class="size"
          >
            {{ talla }}
          </span>
        </div>
      </div>
  
      <!-- Description -->
      <div class="description">
        <h3>Descripción:</h3>
        <p>{{ articulo.descripcion }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ref as dbRef, get } from "firebase/database";
  import { db } from "../../firebaseConfig";
  
  const route = useRoute();
  const router = useRouter();
  const articuloId = route.params.id;
  const articulo = reactive({
    nombre: "",
    precio: 0,
    fotos: [],
    tallas: [],
    descripcion: "",
  });
  
  const activeImageIndex = ref(0); // Track selected gallery image
  
  // Fetch article details from Firebase
  const fetchArticulo = async () => {
  try {
    const snapshot = await get(dbRef(db, `articulos/${articuloId}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      articulo.nombre = data.nombre || "Sin Título";
      articulo.precio = parseFloat(data.precio) || 0; // Parse precio as a float
      articulo.fotos = data.fotos || [];
      articulo.tallas = data.tallas || [];
      articulo.descripcion = data.descripcion || "Sin descripción disponible.";
    }
  } catch (error) {
    console.error("Error al obtener los datos del artículo:", error);
  }
};

  
  // Change selected image in the gallery
  const selectImage = (index) => {
    activeImageIndex.value = index;
  };
  
  // Navigate back to catalog
  const goBack = () => {
    router.push("/app/catalog");
  };
  
  onMounted(fetchArticulo);
  </script>
  
  <style scoped>
  .product-details {
    max-width: 800px;
    margin: 20px auto;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
  }
  
  .btn-back {
    background: #444;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .btn-back:hover {
    background: #555;
  }
  
  .product-title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .gallery {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 15px;
  }
  
  .gallery-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border: 2px solid transparent;
    cursor: pointer;
  }
  
  .gallery-image:hover {
    border-color: #666;
  }
  
  .selected-image img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    border: 1px solid #ccc;
  }
  
  .price {
    text-align: center;
    font-size: 20px;
    margin: 20px 0;
  }
  
  .sizes {
    text-align: center;
    margin: 20px 0;
  }
  
  .size-options {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  .size {
    background: #eee;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 14px;
  }
  
  .size:hover {
    background: #ddd;
  }
  
  .description {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-top: 20px;
  }
  </style>
  