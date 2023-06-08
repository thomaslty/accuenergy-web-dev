import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '../components/HomePage.vue'
import MapPage from "../components/MapPage"

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'HomePage',
        component: HomePage // Set Home component as the default component
    },
    {
        path: '/map',
        name: 'MapPage',
        component: MapPage // Set Home component as the default component
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
