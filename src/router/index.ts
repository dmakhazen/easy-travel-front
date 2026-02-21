import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Trips from '@/views/Trips.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import TripEditor from '@/views/TripEditor.vue'
import TripWishes from '@/views/TripWishes.vue'
import TripLocations from '@/views/TripLocations.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'trips',
      component: Trips,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
    },
    {
      path: '/trips/new',
      name: 'trip-new',
      component: TripEditor,
      meta: { requiresAuth: true },
    },
    {
      path: '/trips/:tripId',
      name: 'trip-edit',
      component: TripEditor,
      meta: { requiresAuth: true },
    },
    {
      path: '/trips/:tripId/wishes',
      name: 'trip-wishes',
      component: TripWishes,
      meta: { requiresAuth: true },
    },
    {
      path: '/trips/:tripId/locations',
      name: 'trip-locations',
      component: TripLocations,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const recoveryHash = window.location.hash
  const hasRecoveryToken =
    recoveryHash.includes('type=recovery') || recoveryHash.includes('access_token=')

  if (hasRecoveryToken && to.path !== '/reset-password') {
    next({
      path: '/reset-password',
      query: to.query,
      hash: recoveryHash,
    })
    return
  }

  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.initialize()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
