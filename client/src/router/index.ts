import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "Home", redirect: { name: "Graph" } },
  {
    path: "/graph",
    name: "Graph",
    component: () => import("@/views/GraphView.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/SettingsView.vue"),
  },
  {
    path: "/help",
    name: "Help",
    component: () => import("@/views/HelpView.vue"),
  },
  {
    path: "/cookiepolicy",
    name: "Cookie Policy",
    component: () => import("@/views/CookiePolicyView.vue"),
  },
  { path: "/:pathMatch(.*)*", redirect: { name: "Graph" } },
];

const router = createRouter({
  // The auth service redirects to `/#/login`, so the app must keep hash URLs.
  history: createWebHashHistory(),
  routes,
  scrollBehavior: (to) =>
    to.hash ? { el: to.hash, behavior: "smooth" } : { top: 0 },
});

export default router;
