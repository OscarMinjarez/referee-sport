import { createWebHistory, createRouter } from "vue-router";

import CatalogView from "./views/clients/CatalogView.vue";
import ProductDetailsView from './views/clients/ProductDetailsView.vue';
import StorageView from "./views/storage/StorageView.vue";
import UploadProductView from "./views/storage/UploadProductView.vue";

import App from "./App.vue";
import SaleView from "./views/sales/SaleView.vue";
import CreateOrderView from "./views/sales/CreateOrderView.vue";
import OrderDetails from "./views/sales/OrderDetails.vue";
import LoginView from "./views/auths/LoginView.vue";

import UnauthorizedView from "./views/auths/UnauthorizedView.vue";

const routes = [
    {
        path: "/",
        redirect: "/app/catalog",
    },
    {
        path: "/app",
        component: App,
        children: [
            // Rutas públicas/autenticación
            {
                path: "login",
                name: "login",
                component: LoginView
            },
            
            // Rutas para clientes (acceso público)
            {
                path: "catalog",
                name: "catalog",
                component: CatalogView,
                meta: { for: 'client' }
            },
            {
                path: "details/:id",
                name: "details",
                component: ProductDetailsView,
                meta: { for: 'client' }
            },
            // Rutas para personal de almacén
            {
                path: "storage",
                name: "storage",
                component: StorageView,
                meta: { requiresAuth: true, roles: ['store', 'sales'] }
            },
            {
                path: "upload/:id?",
                name: "upload",
                component: UploadProductView,
                meta: { requiresAuth: true, roles: ['store'] }
            },
            // Rutas para personal de ventas
            {
                path: "sales",
                name: "sales",
                component: SaleView,
                meta: { requiresAuth: true, roles: ['sales', 'store'] }
            },
            {
                path: "sales/order/:id",
                name: "order",
                component: OrderDetails,
                meta: { requiresAuth: true, roles: ['sales', 'store'] }
            },
            {
                path: "create/:id?",
                name: "create",
                component: CreateOrderView,
                meta: { requiresAuth: true, roles: ['sales'] }
            },

            {
                path: "unauthorized",
                name: "unauthorized",
                component: UnauthorizedView
            }
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const userRole = userData.type;
    if (to.name === 'login' && isAuthenticated) {
        return next(redirectByRole(userRole));
    }
    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            return next({ name: 'login', query: { redirect: to.fullPath } });
        }
        const requiredRoles = to.meta.roles || [];
        const hasPermission = requiredRoles.includes(userRole) || userRole === 'admin';
        if (!hasPermission) {
            return next({ name: 'unauthorized' });
        }
    }
    next();
});

function redirectByRole(role) {
    switch (role) {
        case 'admin':
            return { path: '/app/admin' };
        case 'store':
            return { path: '/app/storage' };
        case 'sales':
            return { path: '/app/sales' };
        default:
            return { path: '/app/catalog' };
    }
}

export default router;
