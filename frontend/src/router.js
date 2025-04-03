import { createWebHistory, createRouter } from "vue-router";

import CatalogView from "./views/clients/CatalogView.vue";
import StorageView from "./views/clients/StorageView.vue"; // Importa correctamente StorageView
import EdicionArticulo from "./views/clients/EdicionArticulo.vue"; // Importa correctamente EdicionArticulo
import EdicionMaterial from "./views/clients/EdicionMateria.vue"; // Importa correctamente EdicionMaterial
import ProductDetails from './views/clients/ProductDetails.vue';

import App from "./App.vue";

const routes = [
    {
        path: "/",
        redirect: "/app/catalog",
    },
    {
        path: "/app",
        component: App,
        children: [
            {
                path: "catalog",
                name: "catalog",
                component: CatalogView,
            },
            {
                path: "inventario", // Ruta para la pantalla de inventario
                name: "inventario",
                component: StorageView, // Usa StorageView como componente
            },
            {
                path: "editar-articulo/:id", // Ruta para editar un artículo específico
                name: "editar-articulo",
                component: EdicionArticulo,
            },
            {
                path: "editar-material/:id", // Route for editing materials
                name: "editar-material",
                component: EdicionMaterial, // Ensure this points to the correct component
            },
            {
                path: "/detalles/:id",
                name: "detalles",
                component: ProductDetails,
              }
              
            
            
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
