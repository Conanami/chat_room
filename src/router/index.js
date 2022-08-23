import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateQr from '../views/CreateQr.vue'

const routes = [
  {
    path: '/',
    name: 'createQr',
    component: CreateQr
  },
  {
    path: '/test',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },{
    path: '/chatRoom',
    name: 'chatRoom',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/ChatRoom')
  },{
    path: '/createQr',
    name: 'createQr',
    component: () => import('../views/CreateQr')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
