<template>
  <!-- Navbar -->
  <Navbar class="navbar-fixed" />
  <main class="d-flex">
    <!-- Filter Section -->
    <header class="header">
      <h1>Artículos Disponibles</h1>
      <div class="filtros my-4">
        <!-- Sort by Price -->
        <div class="dropdown">
          <button class="btn filtro-boton dropdown-toggle" @click="togglePriceDropdown">
            Ordenar por Precio
          </button>
          <ul v-if="showPriceDropdown" class="dropdown-menu">
            <li><button class="dropdown-item" @click="ordenarArticulos('priceAsc')">Bajo a Alto</button></li>
            <li><button class="dropdown-item" @click="ordenarArticulos('priceDesc')">Alto a Bajo</button></li>
          </ul>
        </div>
        <!-- Filter by Size -->
        <div class="dropdown">
          <button class="btn filtro-boton dropdown-toggle" @click="toggleSizeDropdown">
            Filtrar por Tallas
          </button>
          <ul v-if="showSizeDropdown" class="dropdown-menu">
            <li v-for="talla in tallasDisponibles" :key="talla">
              <label>
                <input type="checkbox" :value="talla" v-model="tallasSeleccionadas" @change="filtrarPorTallas" />
                {{ talla }}
              </label>
            </li>
          </ul>
        </div>
        <!-- Filter by Team Name -->
        <button v-for="team in equiposDisponibles" :key="team" type="button" class="btn filtro-boton" :class="{ activo: filtroSeleccionado === team }" @click="filtrarPorEquipo(team)">
          {{ team }}
        </button>
      </div>
    </header>
    <!-- Cards Section -->
    <div class="container-fluid d-flex flex-wrap gap-3 justify-content-center my-4">
      <ProductCard
  v-for="articulo in articulosFiltrados"
  :key="articulo.id"
  :productName="articulo.nombre"
  :productPrice="articulo.precio"
  :productStock="articulo.cantidad"
  :productImage="articulo.fotos[0]"
  @click="$router.push(`/detalles/${articulo.id}`)"
/>
</div>
  </main>
</template>

<script setup>
import Navbar from '../../components/Navbar.vue';
import ProductCard from "../../components/ProductCard.vue";
import { reactive, ref, onMounted } from 'vue';
import { ref as dbRef, onValue } from "firebase/database";
import { db } from "../../firebaseConfig";

// Variables
const filtroSeleccionado = ref(null);
const articulos = reactive([]);
const articulosFiltrados = ref([]);
const equiposDisponibles = ref([]);
const equiposSeleccionados = ref([]); // Multi-select for teams
const tallasDisponibles = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const showPriceDropdown = ref(false);
const showSizeDropdown = ref(false);
const tallasSeleccionadas = ref([]);

// Fetch articles from Firebase
const fetchArticulos = () => {
  const dbRefArticulos = dbRef(db, "articulos");
  onValue(dbRefArticulos, (snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.entries(data).map(([id, item]) => ({
      id,
      nombre: item.nombre || "Sin Título",
      precio: parseFloat(item.precio) || 0,
      cantidad: item.cantidades
        ? Object.values(item.cantidades).reduce((total, qty) => total + qty, 0)
        : 0,
        fotos: item.fotos || ["https://via.placeholder.com/150"], // Fallback to placeholder image if no images are available
      equipo: item.equipo || "Sin Equipo",
      tallas: item.tallas || [],
    }));
    articulos.splice(0, articulos.length, ...items);
    equiposDisponibles.value = [...new Set(items.map((articulo) => articulo.equipo))];
    articulosFiltrados.value = articulos;
  });
};

// Multi-Select Team Filtering
const filtrarPorEquipo = (team) => {
  if (equiposSeleccionados.value.includes(team)) {
    // Remove the team from selection if already selected
    equiposSeleccionados.value = equiposSeleccionados.value.filter((selectedTeam) => selectedTeam !== team);
  } else {
    // Add the team to selection if not already selected
    equiposSeleccionados.value.push(team);
  }

  // Filter articles by selected teams
  articulosFiltrados.value = equiposSeleccionados.value.length === 0
    ? articulos // Show all articles if no teams are selected
    : articulos.filter((articulo) => equiposSeleccionados.value.includes(articulo.equipo));
};


const filtrarPorTallas = () => {
  articulosFiltrados.value = tallasSeleccionadas.value.length === 0
    ? articulos
    : articulos.filter((articulo) => articulo.tallas.some((talla) => tallasSeleccionadas.value.includes(talla)));
};

const ordenarArticulos = (order) => {
  showPriceDropdown.value = false; // Close the dropdown
  filtroSeleccionado.value = order;

  // Sort the filtered array directly to ensure changes are reactive
  articulosFiltrados.value = [...articulosFiltrados.value].sort((a, b) =>
    order === 'priceAsc' ? a.precio - b.precio : b.precio - a.precio
  );

  console.log("Sorted articles:", articulosFiltrados.value); // Debug to confirm sorting
};



// Toggle dropdowns
const togglePriceDropdown = () => {
  showPriceDropdown.value = !showPriceDropdown.value;
};

const toggleSizeDropdown = () => {
  showSizeDropdown.value = !showSizeDropdown.value;
};

// Lifecycle hook
onMounted(fetchArticulos);
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 20px;
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
.dropdown-menu {
  display: block;
  position: absolute;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  list-style: none;
}
.dropdown-menu li {
  margin: 5px 0;
}
label {
  display: flex;
  align-items: center;
  gap: 5px;
}
.container-fluid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.container-fluid .ProductCard {
  box-shadow: 3px 3px 4px 2px rgba(0, 0, 0, 0.404);
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}
.container-fluid .ProductCard:hover {
  box-shadow: 10px 22px 15px rgba(0, 0, 0, 0.685);
}
</style>
