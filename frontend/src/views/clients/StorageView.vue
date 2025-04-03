<template>
  <!-- Navbar -->
  <Navbar />

  <div class="inventario">
    <!-- Header Section -->
    <header class="header">
      <h1>Inventario</h1>
      <!-- Filtros -->
      <div class="filtros my-4">
        <button
          v-for="categoria in categorias"
          :key="categoria"
          type="button"
          class="btn filtro-boton"
          :class="{ activo: filtroSeleccionado === categoria }"
          @click="alternarFiltro(categoria)"
        >
          <span v-if="filtroSeleccionado === categoria">✔</span>
          {{ categoria }}
        </button>
      </div>
    </header>

    <!-- Cards Section -->
    <div class="row productos">
      <div
        v-for="articulo in articulosFiltrados"
        :key="articulo.id"
        class="col-md-4"
      >
        <div class="card" @click="editarArticulo(articulo)">
          <img
            :src="articulo.imagen"
            :alt="articulo.titulo"
            class="card-img-top"
          />
          <div class="card-body">
            <h5 class="card-title">{{ articulo.titulo }}</h5>
            <p class="card-text">Cantidad: <b>{{ articulo.cantidad }}</b></p>
            <p class="card-text" v-if="articulo.cantidad === 0">
              <b>Agotado</b>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Button -->
    <button class="fab" @click="abrirModal">+</button>

    <!-- Modal Dialog -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h3>¿Qué desea crear?</h3>
        <button class="btn btn-primary" @click="crearArticulo">Artículo</button>
        <button class="btn btn-secondary" @click="crearMateriaPrima">Materia Prima</button>
        <button class="btn btn-danger" @click="cerrarModal">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import Navbar from '../../components/Navbar.vue';
import { ref as dbRef, onValue, push } from "firebase/database";
import { db } from "../../firebaseConfig";
import { useRouter } from 'vue-router';

// Variables
const categorias = ["Productos", "Materia Prima"];
const filtroSeleccionado = ref(null); // No filter applied initially
const articulosFiltrados = reactive([]);
const todosArticulos = reactive([]); // Store all fetched items
const mostrarModal = ref(false);
const router = useRouter();

// Function to toggle filters
const alternarFiltro = (categoria) => {
  filtroSeleccionado.value = filtroSeleccionado.value === categoria ? null : categoria;
  filtrarArticulos(); // Apply filter dynamically
};

const fetchArticulos = () => {
  const dbRefArticulos = dbRef(db, "articulos");
  const dbRefMaterias = dbRef(db, "materias_primas");

  // Fetch articles
  onValue(dbRefArticulos, (snapshot) => {
    const productos = Object.entries(snapshot.val() || {}).map(([id, item]) => ({
      id,
      titulo: item.nombre || "Sin Título",
      cantidad: item.cantidades
        ? Object.values(item.cantidades).reduce((total, qty) => total + qty, 0) // Sum all quantities for articles
        : 0, // Default to 0 if no sizes are present
      imagen: item.fotos?.[0] || "https://via.placeholder.com/150",
      tipo: "Productos",
    }));

    // Fetch materials
    onValue(dbRefMaterias, (materiaSnapshot) => {
      const materiales = Object.entries(materiaSnapshot.val() || {}).map(([id, item]) => ({
        id,
        titulo: item.nombre || "Sin Título",
        cantidad: item.cantidad || 0, // Use the `cantidad` field directly for materials
        imagen: item.fotos?.[0] || "https://via.placeholder.com/150",
        tipo: "Materia Prima",
      }));

      // Combine articles and materials
      todosArticulos.splice(0, todosArticulos.length, ...productos, ...materiales);
      filtrarArticulos(); // Apply filters to the combined dataset
    });
  });
};


// Filter items dynamically
const filtrarArticulos = () => {
  if (!filtroSeleccionado.value) {
    articulosFiltrados.splice(0, articulosFiltrados.length, ...todosArticulos);
  } else {
    articulosFiltrados.splice(
      0,
      articulosFiltrados.length,
      ...todosArticulos.filter((item) => item.tipo === filtroSeleccionado.value)
    );
  }
};

// Handle navigation to editing screens
const editarArticulo = (articulo) => {
  const path = articulo.tipo === "Productos"
    ? `/app/editar-articulo/${articulo.id}`
    : `/app/editar-material/${articulo.id}`;
  router.push(path); // Navigate via Vue Router
};

// Function to create a new article
const crearArticulo = async () => {
  try {
    const nuevoArticulo = {
      nombre: "",
      precio: 0,
      equipo: "",
      descripcion: "",
      tallas: [],
      fotos: [],
    };

    const newRef = await push(dbRef(db, "articulos"), nuevoArticulo);
    router.push(`/app/editar-articulo/${newRef.key}`); // Redirect to edit page
  } catch (error) {
    console.error("Error al crear el artículo:", error);
  }
};

// Function to create a new material
const crearMateriaPrima = async () => {
  try {
    const nuevoMaterial = {
      nombre: "Nuevo Material",
      tipo: "",
      cantidad: 0,
      colores: [],
      descripcion: "",
      fotos: [],
    };

    const newRef = await push(dbRef(db, "materias_primas"), nuevoMaterial);
    router.push(`/app/editar-material/${newRef.key}`); // Redirect to edit page
  } catch (error) {
    console.error("Error al crear el material:", error);
  }
};

// Open/close modal
const abrirModal = () => (mostrarModal.value = true);
const cerrarModal = () => (mostrarModal.value = false);

// Lifecycle Hook
onMounted(fetchArticulos);
</script>
<style scoped>
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.filtro-boton {
  background-color: #ccc;
  border: none;
  color: black;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filtro-boton:hover {
  background-color: #bbb;
  transform: scale(1.05);
}

.filtro-boton.activo {
  background-color: #444;
  color: white;
}

.productos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.card {
  box-shadow: 3px 3px 4px 2px rgba(0, 0, 0, 0.404);
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: 10px 22px 15px rgba(0, 0, 0, 0.685);
}

.card-body {
  padding: 15px;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
}

.card-title {
  font-size: 1.5em;
  margin-bottom: 5px;
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  border: none;
  color: white;
  padding: 15px 20px;
  font-size: 24px;
  border-radius: 50px;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.fab:hover {
  background-color: #0056b3;
}

/* Modal Styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.modal-content button {
  margin: 10px;
}
</style>
