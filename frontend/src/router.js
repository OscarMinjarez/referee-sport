import { createWebHistory, createRouter } from "vue-router";
import App from "./App.vue";
import StorageView from "./views/storage/StorageView.vue";

const routes = [
    {
        path: "/",
        redirect: "/app/storage",
    },
    {
        path: "/app",
        component: App,
        children: [
            {
                path: "storage",
                name: "storage",
                component: StorageView
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;