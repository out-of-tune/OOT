import { createRouter, createWebHashHistory } from "vue-router";

const Login = () => import("@/views/Login");
const Graph = () => import("@/components/Graph.vue");
const Settings = () => import("@/views/Settings.vue");
const Guide = () => import("@/views/Guide.vue");
const CookiePolicy = () => import("@/views/CookiePolicy.vue");

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },

  {
    path: "/",
    name: "Home",
    redirect: {
      name: "Graph",
    },
  },
  {
    path: "/graph",
    name: "Graph",
    component: Graph,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
  {
    path: "/help",
    name: "Help",
    component: Guide,
  },
  {
    path: "/cookiepolicy",
    name: "Cookie Policy",
    component: CookiePolicy,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
