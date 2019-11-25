import Vue from 'vue'
import Router from 'vue-router'

const Login = () => import('@/views/Login')
const Graph  = () => import("@/components/Graph.vue")
const Settings  = () => import("@/views/Settings.vue")
const Guide  = () => import("@/views/Guide.vue")
const CookiePolicy  = () => import("@/views/CookiePolicy.vue")

// import Login from '@/views/Login'
// import Graph from "@/components/Graph.vue";
// import Settings from "@/views/Settings.vue"
// import Guide from "@/views/Guide.vue"
// import CookiePolicy from "@/views/CookiePolicy.vue"


Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login
        },

        {
            path: '/',
            name: 'Home',
            redirect: {
                name: 'Graph'
            },
        },
        {
            path: '/graph',
            name: 'Graph',
            component: Graph
        },
        {
            path: '/settings',
            name: 'Settings',
            component: Settings
        },
        {
            path: '/help',
            name: 'Help',
            component: Guide
        },
        {
            path: '/cookiepolicy',
            name: 'Cookie Policy',
            component: CookiePolicy
        }
    ],
    scrollBehavior (to, from, savedPosition) {
        if (to.hash) {
          return {
            selector: to.hash,
            offset: { x: 0, y: 64 }
          }
        }
      }
      
})

export default router
