import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Home' },
    },
    {
      path: '/insights',
      name: 'Insights',
      component: () => import('@/views/InsightsView.vue'),
      meta: { title: 'Insights' },
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: () => import('@/views/TasksView.vue'),
      meta: { title: 'Tasks' },
      props: (route) => ({ selectedTaskId: route.query.selected_task }),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Settings' },
    },
    {
      path: '/login',
      name: 'Login',
      redirect: '/',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.afterEach((to) => {
  document.title = `Element AI | ${to.meta.title || 'Fleet Management'}`
})

export default router
