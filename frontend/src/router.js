import { createWebHistory, createRouter } from "vue-router";
import App from "./App.vue";
import StorageView from "./views/storage/StorageView.vue";
import UploadProductView from "./views/storage/UploadProductView.vue";

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
            },
            {
                path: "upload",
                name: "upload",
                component: UploadProductView
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;