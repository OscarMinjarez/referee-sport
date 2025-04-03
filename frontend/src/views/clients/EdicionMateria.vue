<template>
  <!-- Navbar -->
  <Navbar />

  <div class="edicion-material">
    <!-- Header -->
    <header class="header">
      <h1>Editar Material</h1>
    </header>

    <!-- Formulario de edición -->
    <form class="formulario">
      <div class="form-group">
        <label for="nombre">Nombre del material</label>
        <input
          v-model="material.nombre"
          type="text"
          id="nombre"
          class="form-control"
          placeholder="Ejemplo: Tela de poliéster"
        />
      </div>

      <div class="form-group">
        <label for="tipo">Tipo de material</label>
        <select v-model="material.tipo" id="tipo" class="form-control">
          <option disabled value="">Seleccione tipo</option>
          <option>Tela</option>
          <option>Hilo</option>
          <option>Parches</option>
          <option>Botones</option>
          <option>Vinilo</option>
          <option>Otro</option>
        </select>
        <input
          v-if="material.tipo === 'Otro'"
          v-model="otroTipo"
          type="text"
          class="form-control mt-2"
          placeholder="Ingrese otro tipo de material"
        />
      </div>

      <div class="form-group">
        <label for="cantidad">Cantidad disponible</label>
        <input
          v-model.number="material.cantidad"
          type="number"
          id="cantidad"
          class="form-control"
          placeholder="Ejemplo: 100 unidades"
          min="0"
          step="1"
        />
      </div>

      <div class="form-group">
        <label for="color">Colores disponibles</label>
        <div class="checkbox-group">
          <div v-for="color in coloresDisponibles" :key="color" class="checkbox-item">
            <label class="custom-checkbox">
              <input type="checkbox" :value="color" v-model="material.colores" />
              <span class="checkbox-label">{{ color }}</span>
            </label>
          </div>
          <label class="custom-checkbox">
            <input type="checkbox" value="Otro" v-model="material.colores" />
            <span class="checkbox-label">Otro</span>
          </label>
          <input
            v-if="material.colores.includes('Otro')"
            v-model="otroColor"
            type="text"
            class="form-control mt-2"
            placeholder="Ingrese otro color"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción</label>
        <textarea
          v-model="material.descripcion"
          id="descripcion"
          class="form-control"
          placeholder="Ejemplo: Tela resistente a agua, ideal para uniformes deportivos"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Fotos del material</label>
        <div class="fotos">
          <img
            v-for="(foto, index) in material.fotos"
            :key="index"
            :src="foto"
            :alt="material.nombre"
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
const materialId = route.params.id; // Fetch ID from route params

const material = reactive({
  nombre: "",
  tipo: "",
  cantidad: 0,
  colores: [],
  descripcion: "",
  fotos: [],
});

const otroTipo = ref("");
const otroColor = ref("");
const coloresDisponibles = ["Rojo", "Azul", "Verde", "Blanco", "Negro", "Amarillo"];
const mostrarMenuFotos = ref(false);
const fotoURL = ref("");

const abrirMenuFotos = () => {
  mostrarMenuFotos.value = true;
};

const agregarFotoArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      material.fotos.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const agregarFotoURL = () => {
  if (fotoURL.value) {
    material.fotos.push(fotoURL.value);
    fotoURL.value = "";
    mostrarMenuFotos.value = false;
  }
};

const guardarCambios = async () => {
  if (otroTipo.value) {
    material.tipo = otroTipo.value;
  }
  if (otroColor.value) {
    material.colores.push(otroColor.value);
  }

  const path = `materias_primas/${materialId}`;
  await set(dbRef(db, path), material);
  console.log("Material guardado:", material);
};

const loadMaterialData = async () => {
  try {
    const snapshot = await get(dbRef(db, `materias_primas/${materialId}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      material.nombre = data.nombre || "";
      material.tipo = data.tipo || "";
      material.cantidad = data.cantidad || 0;
      material.colores = data.colores || [];
      material.descripcion = data.descripcion || "";
      material.fotos = data.fotos || [];
    }
  } catch (error) {
    console.error("Error loading material data:", error);
  }
};

onMounted(loadMaterialData);
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
