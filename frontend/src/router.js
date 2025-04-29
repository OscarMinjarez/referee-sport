import { createWebHistory, createRouter } from "vue-router";

import CatalogView from "./views/clients/CatalogView.vue";
import ProductDetailsView from './views/clients/ProductDetailsView.vue';
import StorageView from "./views/storage/StorageView.vue";
import UploadProductView from "./views/storage/UploadProductView.vue";

import App from "./App.vue";
import SaleView from "./views/sales/SaleView.vue";
import CreateOrderView from "./views/sales/CreateOrderView.vue";

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
                component: ProductDetailsView,
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
            },
            {
                path: "sales",
                name: "sales",
                component: SaleView
            },
            {
                path: "create",
                name: "create",
                component: CreateOrderView
            }
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
