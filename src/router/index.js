import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/select',
    name: 'select',
    component: () => import('../views/SelectView.vue')
  },
  {
    path: '/practice/:type',
    name: 'practice',
    component: () => import('../views/PracticeView.vue')
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('../views/ProgressView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
