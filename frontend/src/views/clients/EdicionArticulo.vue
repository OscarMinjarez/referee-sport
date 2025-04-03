<template>
  <!-- Navbar -->
  <Navbar />

  <div class="edicion-articulo">
    <!-- Header -->
    <header class="header">
      <h1>Editar Artículo</h1>
    </header>

    <!-- Formulario de edición -->
    <form class="formulario">
      <div class="form-group">
        <label for="nombre">Nombre del artículo</label>
        <input
          v-model="articulo.nombre"
          type="text"
          id="nombre"
          class="form-control"
          placeholder="Ejemplo: Camiseta del equipo"
        />
      </div>

      <div class="form-group">
        <label for="precio">Precio</label>
        <input
          v-model="articulo.precio"
          type="text"
          id="precio"
          class="form-control"
          @blur="formatearPrecio"
          placeholder="Ejemplo: 250.00 MXN"
        />
      </div>

      <div class="form-group">
        <label for="equipo">Equipo</label>
        <input
          v-model="articulo.equipo"
          type="text"
          id="equipo"
          class="form-control"
          placeholder="Ejemplo: Chivas"
        />
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción</label>
        <textarea
          v-model="articulo.descripcion"
          id="descripcion"
          class="form-control"
          placeholder="Ejemplo: Camiseta oficial del equipo con tecnología Dry-Fit"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Tallas disponibles</label>
        <div class="checkbox-group">
          <div v-for="talla in tallasDisponibles" :key="talla" class="checkbox-item">
            <label class="custom-checkbox">
              <input type="checkbox" :value="talla" v-model="articulo.tallas" @change="toggleCantidadInput(talla)" />
              <span class="checkbox-label">{{ talla }}</span>
            </label>
            <div v-if="articulo.tallas.includes(talla)" class="cantidad-input">
              <input
                v-model.number="cantidadPorTalla[talla]"
                type="number"
                class="form-control"
                placeholder="Cantidad disponible"
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Fotos del artículo</label>
        <div class="fotos">
          <img
            v-for="(foto, index) in articulo.fotos"
            :key="index"
            :src="foto"
            :alt="articulo.nombre"
            class="foto"
          />
        </div>
        <button type="button" class="btn btn-primary" @click="abrirMenuFotos">Agregar Foto</button>
      </div>

      <div v-if="mostrarMenuFotos" class="menu-fotos">
        <input type="file" @change="agregarFotoArchivo" />
        <input
          type="url"
          v-model="fotoURL"
          placeholder="Ingresa la URL de la foto"
          class="form-control"
        />
        <button type="button" class="btn btn-success" @click="agregarFotoURL">Agregar Foto desde URL</button>
      </div>

      <button type="button" class="btn btn-success" @click="guardarCambios">Guardar Cambios</button>
    </form>
  </div>
</template>

<script setup>
import Navbar from '../../components/Navbar.vue';
import { reactive, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ref as dbRef, set, get } from "firebase/database";
import { db } from "../../firebaseConfig";

const route = useRoute();
const articuloId = route.params.id; // Retrieve the article ID from route
const articulo = reactive({
  id: articuloId || null, // Retain ID if present
  nombre: "",
  precio: "",
  equipo: "",
  descripcion: "",
  tallas: [],
  fotos: [],
});

const cantidadPorTalla = reactive({});
const tallasDisponibles = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const mostrarMenuFotos = ref(false);
const fotoURL = ref("");

const formatearPrecio = () => {
  const parsedPrecio = parseFloat(articulo.precio.replace(/[^\d.]/g, ""));
  articulo.precio = isNaN(parsedPrecio)
    ? "0.00 MXN"
    : `${parsedPrecio.toFixed(2)} MXN`;
};

const toggleCantidadInput = (talla) => {
  if (!articulo.tallas.includes(talla)) {
    // If the size is unchecked, remove it from the quantities object
    delete cantidadPorTalla[talla];
  } else {
    // If the size is checked, ensure it is initialized with a default value
    if (!cantidadPorTalla[talla]) {
      cantidadPorTalla[talla] = 0; // Default to 0 if the size is newly added
    }
  }
};


const abrirMenuFotos = () => {
  mostrarMenuFotos.value = true;
};

const agregarFotoArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      articulo.fotos.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const agregarFotoURL = () => {
  if (fotoURL.value) {
    articulo.fotos.push(fotoURL.value);
    fotoURL.value = "";
    mostrarMenuFotos.value = false;
  }
};

const guardarCambios = async () => {
  try {
    // Ensure `cantidadPorTalla` has no unintended keys
    const updatedCantidades = { ...cantidadPorTalla };

    // Remove any nested or invalid keys like "value" from the existing `cantidades`
    Object.keys(updatedCantidades).forEach((key) => {
      if (typeof updatedCantidades[key] === "object") {
        delete updatedCantidades[key]; // Remove any nested objects
      }
    });

    // Overwrite the `cantidades` field in the article
    articulo.cantidades = updatedCantidades;

    if (articulo.id) {
      const path = `articulos/${articulo.id}`;
      await set(dbRef(db, path), {
        ...articulo, // Spread article properties
        cantidades: updatedCantidades, // Properly overwrite cantidades
      });
      console.log("Artículo actualizado correctamente:", articulo);
    } else {
      console.error("Error: No ID encontrado para actualizar el artículo.");
    }
  } catch (error) {
    console.error("Error al guardar los cambios:", error);
  }
};






const loadArticuloData = async () => {
  try {
    const snapshot = await get(dbRef(db, `articulos/${articuloId}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      articulo.id = articuloId; // Explicitly set the ID
      articulo.nombre = data.nombre || "";
      articulo.precio = data.precio || "";
      articulo.equipo = data.equipo || "";
      articulo.descripcion = data.descripcion || "";
      articulo.tallas = data.tallas || [];
      articulo.fotos = data.fotos || [];
      cantidadPorTalla.value = data.cantidades || {};
    }
  } catch (error) {
    console.error("Error loading article data:", error);
  }
};


onMounted(loadArticuloData);
</script>
<style scoped>
.header {
  text-align: center;
  margin-bottom: 20px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.checkbox-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  font-size: 18px;
  cursor: pointer;
}

.custom-checkbox input {
  width: 20px;
  height: 20px;
}

.cantidad-input {
  margin-left: 35px;
  margin-top: 5px;
}

.fotos {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.foto {
  width: 100px;
  height: auto;
  border: 1px solid #ccc;
}

.menu-fotos {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
</style>
