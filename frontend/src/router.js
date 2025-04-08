import { createWebHistory, createRouter } from "vue-router";

import CatalogView from "./views/clients/CatalogView.vue";
import ProductDetails from './views/clients/ProductDetails.vue';
import StorageView from "./views/storage/StorageView.vue";
import UploadProductView from "./views/storage/UploadProductView.vue";

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
                path: "details/:id",
                name: "details",
                component: ProductDetails,
            },
            {
                path: "storage",
                name: "storage",
                component: StorageView
            },
            {
                path: "upload/:id?",
                name: "upload",
                component: UploadProductView
            }
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
