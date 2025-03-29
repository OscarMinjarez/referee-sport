import { createWebHistory, createRouter } from "vue-router";

import CatalogView from "./views/clients/CatalogView.vue";
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
                component: CatalogView
            }
        ],
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;