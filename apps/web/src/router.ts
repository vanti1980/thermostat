import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    alias: '/dashboard',
    name: 'dashboard',
    component: () => import('./components/Dashboard.vue'),
  },
  {
    path: '/schedules',
    name: 'schedules',
    component: () => import('./components/Schedules.vue'),
    props: true,
  },
  {
    path: '/schedules/instant',
    name: 'scheduleInstant',
    component: () => import('./components/Schedule.vue'),
    props: true,
  },
  {
    path: '/schedules/new',
    name: 'scheduleNew',
    component: () => import('./components/Schedule.vue'),
    props: true,
  },
  {
    path: '/schedules/:scheduleId',
    name: 'schedule',
    component: () => import('./components/Schedule.vue'),
    props: true,
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('./components/Settings.vue'),
    props: true,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
